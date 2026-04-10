import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import { emailWrapper, emailHeading, emailSubtext, emailButton } from "@/lib/emails/template";

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { email } = body;

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Valid email address is required" },
      { status: 400 }
    );
  }

  const trimmedEmail = email.trim().toLowerCase();
  const adminSupabase = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const redirectTo = `${siteUrl}/auth/set-password?mode=reset`;

  const { data: listData } = await adminSupabase.auth.admin.listUsers({
    page: 1,
    perPage: 50,
  });

  const existingUser = listData?.users?.find(
    (u) => u.email?.toLowerCase() === trimmedEmail
  );

  if (!existingUser) {
    return NextResponse.json({ success: true });
  }

  const { data: linkData, error: linkError } =
    await adminSupabase.auth.admin.generateLink({
      type: "recovery",
      email: trimmedEmail,
      options: { redirectTo },
    });

  if (linkError || !linkData?.properties?.action_link) {
    console.error("Generate recovery link error:", linkError);
    return NextResponse.json(
      { error: "Failed to generate reset link" },
      { status: 500 }
    );
  }

  const actionLink = linkData.properties.action_link;
  const userName =
    existingUser.user_metadata?.full_name || trimmedEmail.split("@")[0];

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: trimmedEmail,
      subject: "Reset Your AmiNexa Password",
      html: emailWrapper(`
        ${emailHeading("Password Reset")}
        ${emailSubtext(`Hi ${userName}, we received a request to reset your AmiNexa account password. Click the button below to choose a new password.`)}

        ${emailButton(actionLink, "Reset Password")}

        <p style="font-family: Helvetica, Arial, sans-serif; color: #999; font-size: 13px; line-height: 1.6; margin: 28px 0 0;">
          This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.
        </p>
      `),
    });
  } catch (emailError) {
    console.error("Email send error:", emailError);
    return NextResponse.json(
      { error: "Failed to send reset email" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
