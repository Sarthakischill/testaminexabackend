const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aminexa.net";

export function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 0 auto; padding: 32px 16px;">
    <!-- Header -->
    <div style="text-align: center; padding: 32px 0 24px;">
      <a href="${siteUrl}" style="text-decoration: none;">
        <h1 style="font-family: Helvetica, Arial, sans-serif; font-size: 26px; font-weight: 400; letter-spacing: -0.01em; color: #000; margin: 0;">AmiNexa</h1>
        <p style="font-family: Helvetica, Arial, sans-serif; font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #999; margin: 6px 0 0;">Premium Research Peptides</p>
      </a>
    </div>

    <!-- Body -->
    <div style="background: #ffffff; border-radius: 16px; padding: 40px 32px; border: 1px solid #e8e8e8;">
      ${content}
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 28px 0 8px;">
      <p style="font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #bbb; line-height: 1.8; margin: 0;">
        AmiNexa — Premium Research Peptides<br/>
        For research use only. Not intended for human consumption.<br/>
        <a href="${siteUrl}" style="color: #999; text-decoration: underline;">aminexa.net</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function emailHeading(text: string): string {
  return `<h2 style="font-family: Helvetica, Arial, sans-serif; font-size: 22px; font-weight: 400; color: #000; margin: 0 0 8px;">${text}</h2>`;
}

export function emailSubtext(text: string): string {
  return `<p style="font-family: Helvetica, Arial, sans-serif; color: #888; font-size: 14px; line-height: 1.7; margin: 0 0 28px;">${text}</p>`;
}

export function emailCard(content: string): string {
  return `<div style="background: #fafafa; border-radius: 12px; padding: 24px; margin-bottom: 20px;">${content}</div>`;
}

export function emailLabel(text: string): string {
  return `<p style="font-family: Helvetica, Arial, sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #999; margin: 0 0 8px;">${text}</p>`;
}

export function emailButton(href: string, text: string): string {
  return `
    <div style="text-align: center; margin: 32px 0 0;">
      <a href="${href}" style="display: inline-block; padding: 14px 40px; background: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 999px; font-family: Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; border: 2px solid #333;">
        ${text}
      </a>
    </div>`;
}

export function emailStatusBadge(text: string, color: "green" | "amber" | "blue" | "purple" | "orange" | "red"): string {
  const colors = {
    green: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" },
    amber: { bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
    blue: { bg: "#f0f9ff", border: "#bae6fd", text: "#0369a1" },
    purple: { bg: "#f5f3ff", border: "#ddd6fe", text: "#5b21b6" },
    orange: { bg: "#fff7ed", border: "#fed7aa", text: "#9a3412" },
    red: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" },
  };
  const c = colors[color];
  return `<div style="background: ${c.bg}; border: 1px solid ${c.border}; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px;">
    <p style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: ${c.text}; margin: 0; line-height: 1.6;">${text}</p>
  </div>`;
}

export function emailDivider(): string {
  return `<hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />`;
}
