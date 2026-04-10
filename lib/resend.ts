import { Resend } from "resend";
import { siteConfig } from "@/config/site";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export const FROM_EMAIL = siteConfig.fromEmail;
