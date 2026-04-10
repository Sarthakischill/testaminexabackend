import { NextResponse } from "next/server";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import { getEmailSetting } from "@/lib/emails/settings";
import { emailWrapper, emailHeading, emailSubtext, emailCard, emailLabel, emailButton } from "@/lib/emails/template";

const SUBJECT_MAP: Record<string, string> = {
  order: "Order Inquiry",
  product: "Product Question",
  wholesale: "Wholesale / Bulk",
  coa: "Certificate of Analysis",
  other: "General Inquiry",
};

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, email, subject, message } = body;

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  if (message.length > 5000) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  const subjectLabel = SUBJECT_MAP[subject] || subject;

  const setting = await getEmailSetting("contact_form");
  if (!setting.enabled || setting.recipients.length === 0) {
    return NextResponse.json({ error: "Contact form is currently disabled" }, { status: 503 });
  }

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: setting.recipients,
      replyTo: email,
      subject: `Contact Form: ${subjectLabel} — from ${name}`,
      html: emailWrapper(`
        ${emailHeading("New Contact Form Submission")}
        ${emailSubtext("Received from the AmiNexa website contact page.")}

        ${emailCard(`
          <table style="width: 100%; border-collapse: collapse; font-family: Helvetica, Arial, sans-serif;">
            <tr>
              <td style="padding: 10px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #999; width: 80px; vertical-align: top;">Name</td>
              <td style="padding: 10px 0; font-size: 14px; color: #333; font-weight: 500;">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #999; vertical-align: top;">Email</td>
              <td style="padding: 10px 0; font-size: 14px;"><a href="mailto:${escapeHtml(email)}" style="color: #0369a1; text-decoration: none;">${escapeHtml(email)}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #999; vertical-align: top;">Topic</td>
              <td style="padding: 10px 0; font-size: 14px; color: #333;">${escapeHtml(subjectLabel)}</td>
            </tr>
          </table>
        `)}

        ${emailCard(`
          ${emailLabel("Message")}
          <p style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.8; white-space: pre-wrap; margin: 0;">${escapeHtml(message)}</p>
        `)}

        ${emailButton(`mailto:${escapeHtml(email)}`, `Reply to ${escapeHtml(name)}`)}
      `),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send contact email:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
