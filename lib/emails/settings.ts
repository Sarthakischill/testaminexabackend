import { createAdminClient } from "@/lib/supabase/admin";

export type EmailSettingId =
  | "order_notification"
  | "contact_form"
  | "order_confirmed"
  | "order_shipped"
  | "order_received";

type EmailSetting = {
  id: string;
  recipients: string[];
  enabled: boolean;
};

const FALLBACK_RECIPIENTS: Record<EmailSettingId, string[]> = {
  order_notification: ["peptides.solutions@gmail.com", "contact@aminexa.net"],
  contact_form: ["peptides.solutions@gmail.com", "contact@aminexa.net"],
  order_confirmed: [],
  order_shipped: [],
  order_received: [],
};

export async function getEmailSetting(id: EmailSettingId): Promise<{ recipients: string[]; enabled: boolean }> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("email_settings")
      .select("recipients, enabled")
      .eq("id", id)
      .single();

    if (error || !data) {
      return { recipients: FALLBACK_RECIPIENTS[id], enabled: true };
    }

    return data as EmailSetting;
  } catch {
    return { recipients: FALLBACK_RECIPIENTS[id], enabled: true };
  }
}
