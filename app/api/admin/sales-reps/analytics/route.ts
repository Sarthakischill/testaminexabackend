import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: reps } = await admin
    .from("sales_reps")
    .select("id, name, email, active, created_at")
    .order("name");

  if (!reps || reps.length === 0) {
    return NextResponse.json({ analytics: [] });
  }

  const repIds = reps.map((r) => r.id);

  const { data: orders } = await admin
    .from("orders")
    .select("id, total, attributed_rep_id, promo_code, created_at, status")
    .in("attributed_rep_id", repIds);

  const { data: accounts } = await admin
    .from("profiles")
    .select("id, email, referred_by_rep_id, referred_by_code")
    .in("referred_by_rep_id", repIds);

  const analytics = reps.map((rep) => {
    const repOrders = (orders || []).filter((o) => o.attributed_rep_id === rep.id);
    const repAccounts = (accounts || []).filter((a) => a.referred_by_rep_id === rep.id);
    const totalRevenue = repOrders.reduce((sum, o) => sum + Number(o.total), 0);

    return {
      ...rep,
      orderCount: repOrders.length,
      accountCount: repAccounts.length,
      totalRevenue,
      accounts: repAccounts,
      recentOrders: repOrders.slice(0, 10),
    };
  });

  return NextResponse.json({ analytics });
}
