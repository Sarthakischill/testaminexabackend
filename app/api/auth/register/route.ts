import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import { emailWrapper, emailHeading, emailSubtext, emailCard, emailLabel, emailButton } from "@/lib/emails/template";
import { siteConfig } from "@/config/site";

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

  const { email, fullName, dateOfBirth, agreedToTerms, researchAck } = body;

  if (!email || !fullName || !dateOfBirth) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  if (!agreedToTerms || !researchAck) {
    return NextResponse.json(
      { error: "You must accept both acknowledgments" },
      { status: 400 }
    );
  }

  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  if (isNaN(age) || age < 21) {
    return NextResponse.json(
      { error: "You must be at least 21 years of age to register." },
      { status: 403 }
    );
  }

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = fullName.trim();

  if (trimmedName.length < 2 || trimmedName.length > 200) {
    return NextResponse.json(
      { error: "Name must be between 2 and 200 characters" },
      { status: 400 }
    );
  }

  const adminSupabase = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const redirectTo = `${siteUrl}/auth/set-password`;

  let userId: string;
  let isExistingUnconfirmed = false;

  const { data: newUser, error: createError } =
    await adminSupabase.auth.admin.createUser({
      email: trimmedEmail,
      email_confirm: false,
      user_metadata: {
        full_name: trimmedName,
        date_of_birth: dateOfBirth,
      },
    });

  if (createError) {
    const msg = createError.message?.toLowerCase() || "";
    const isConflict =
      msg.includes("already been registered") ||
      msg.includes("already exists") ||
      msg.includes("duplicate") ||
      createError.status === 422;

    if (!isConflict) {
      console.error("Create user error:", createError);
      return NextResponse.json(
        { error: "Failed to create account. Please try again." },
        { status: 500 }
      );
    }

    const { data: listData } = await adminSupabase.auth.admin.listUsers({
      page: 1,
      perPage: 50,
    });

    const existing = listData?.users?.find(
      (u) => u.email?.toLowerCase() === trimmedEmail
    );

    if (!existing) {
      return NextResponse.json(
        { error: "Failed to create account. Please try again." },
        { status: 500 }
      );
    }

    if (existing.email_confirmed_at) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists. Please log in instead.",
        },
        { status: 409 }
      );
    }

    userId = existing.id;
    isExistingUnconfirmed = true;

    await adminSupabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        full_name: trimmedName,
        date_of_birth: dateOfBirth,
      },
    });
  } else {
    userId = newUser.user.id;
  }

  const { data: linkData, error: linkError } =
    await adminSupabase.auth.admin.generateLink({
      type: "invite",
      email: trimmedEmail,
      options: { redirectTo },
    });

  if (linkError || !linkData?.properties?.action_link) {
    console.error("Generate link error:", linkError);
    if (!isExistingUnconfirmed) {
      await adminSupabase.auth.admin.deleteUser(userId);
    }
    return NextResponse.json(
      { error: "Failed to generate verification link" },
      { status: 500 }
    );
  }

  const actionLink = linkData.properties.action_link;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: trimmedEmail,
      subject: `Verify Your ${siteConfig.name} Account`,
      html: emailWrapper(`
        ${emailHeading(`Welcome, ${trimmedName}.`)}
        ${emailSubtext(`Thank you for registering with ${siteConfig.name}. To complete your account setup, please verify your email address by clicking the button below. You'll then be prompted to create your password.`)}

        ${emailButton(actionLink, "Verify &amp; Set Password")}

        <p style="font-family: Helvetica, Arial, sans-serif; color: #999; font-size: 13px; line-height: 1.6; margin: 28px 0 0;">
          This link will expire in 24 hours. If you didn't create an account with ${siteConfig.name}, you can safely ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 28px 0;" />

        ${emailCard(`
          ${emailLabel("Your Registration Details")}
          <p style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #555; margin: 0; line-height: 1.8;">
            <strong>Name:</strong> ${trimmedName}<br/>
            <strong>Email:</strong> ${trimmedEmail}<br/>
            <strong>Date of Birth:</strong> ${dateOfBirth}
          </p>
        `)}
      `),
    });
  } catch (emailError) {
    console.error("Email send error:", emailError);
    if (!isExistingUnconfirmed) {
      await adminSupabase.auth.admin.deleteUser(userId);
    }
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
