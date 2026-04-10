import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const adminClient = createAdminClient();

  const columns = [
    { name: "carrier_code", type: "text" },
    { name: "service_code", type: "text" },
    { name: "service_name", type: "text" },
    { name: "shipstation_order_id", type: "text" },
    { name: "estimated_delivery", type: "text" },
    { name: "qbo_invoice_id", type: "text" },
  ];

  const results: string[] = [];

  for (const col of columns) {
    const { error } = await adminClient.rpc("exec_sql", {
      query: `ALTER TABLE orders ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`,
    });

    if (error) {
      results.push(`${col.name}: ${error.message}`);
    } else {
      results.push(`${col.name}: OK`);
    }
  }

  const constraints = [
    {
      name: "payment_method_check",
      sql: `DO $$ BEGIN
        ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
        ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check
          CHECK (payment_method IN ('zelle', 'crypto', 'credit_card'));
      EXCEPTION WHEN others THEN NULL;
      END $$;`,
    },
    {
      name: "status_check",
      sql: `DO $$ BEGIN
        ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
        ALTER TABLE orders ADD CONSTRAINT orders_status_check
          CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'awaiting_payment'));
      EXCEPTION WHEN others THEN NULL;
      END $$;`,
    },
  ];

  for (const c of constraints) {
    const { error } = await adminClient.rpc("exec_sql", { query: c.sql });
    if (error) {
      results.push(`constraint ${c.name}: ${error.message}`);
    } else {
      results.push(`constraint ${c.name}: OK`);
    }
  }

  return NextResponse.json({ results });
}
