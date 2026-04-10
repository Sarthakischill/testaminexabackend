import { NextResponse } from "next/server";
import { getConnectionInfo, disconnectQbo } from "@/lib/qbo";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const info = await getConnectionInfo();
    return NextResponse.json(info);
  } catch {
    return NextResponse.json({ connected: false });
  }
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  if (user.app_metadata?.role === "admin") return user;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return profile?.role === "admin" ? user : null;
}

export async function DELETE() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await disconnectQbo();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to disconnect" },
      { status: 500 }
    );
  }
}
