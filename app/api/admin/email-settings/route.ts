import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("email_settings")
      .select("*")
      .order("label");

    if (error) {
      console.error("email_settings fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ settings: data || [] });
  } catch (err) {
    console.error("email_settings exception:", err);
    return NextResponse.json({ error: "Failed to load email settings" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { id, recipients, enabled } = body;

  if (!id) {
    return NextResponse.json({ error: "Setting ID required" }, { status: 400 });
  }

  if (recipients !== undefined && !Array.isArray(recipients)) {
    return NextResponse.json({ error: "Recipients must be an array" }, { status: 400 });
  }

  if (recipients) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const r of recipients) {
      if (!emailRegex.test(r)) {
        return NextResponse.json({ error: `Invalid email: ${r}` }, { status: 400 });
      }
    }
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (recipients !== undefined) updates.recipients = recipients;
  if (enabled !== undefined) updates.enabled = enabled;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("email_settings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("email_settings update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ setting: data });
  } catch (err) {
    console.error("email_settings update exception:", err);
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
  }
}
