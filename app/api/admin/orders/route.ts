import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const PAGE_SIZE = 25;

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const archived = searchParams.get("archived") === "true";
  const sortBy = searchParams.get("sort") || "created_at";
  const sortDir = searchParams.get("dir") === "asc" ? true : false;

  const adminClient = createAdminClient();

  const result = await fetchOrders(adminClient, {
    status,
    search,
    page,
    archived,
    sortBy,
    sortDir,
    useArchiveFilter: true,
  });

  if (result.error) {
    const fallback = await fetchOrders(adminClient, {
      status,
      search,
      page,
      archived,
      sortBy,
      sortDir,
      useArchiveFilter: false,
    });

    if (fallback.error) {
      return NextResponse.json(
        { error: fallback.error },
        { status: 500 }
      );
    }

    return NextResponse.json(fallback.data);
  }

  return NextResponse.json(result.data);
}

async function fetchOrders(
  adminClient: ReturnType<typeof createAdminClient>,
  opts: {
    status: string | null;
    search: string | null;
    page: number;
    archived: boolean;
    sortBy: string;
    sortDir: boolean;
    useArchiveFilter: boolean;
  }
) {
  const { status, search, page, archived, sortBy, sortDir, useArchiveFilter } =
    opts;

  let query = adminClient
    .from("orders")
    .select("*")
    .order(sortBy, { ascending: sortDir })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const countQuery = adminClient
    .from("orders")
    .select("id", { count: "exact", head: true });

  if (useArchiveFilter) {
    if (archived) {
      query = query.eq("archived", true);
      countQuery.eq("archived", true);
    } else {
      query = query.or("archived.is.null,archived.eq.false");
      countQuery.or("archived.is.null,archived.eq.false");
    }
  }

  if (status && status !== "all") {
    query = query.eq("status", status);
    countQuery.eq("status", status);
  }

  if (search) {
    const s = search.trim();
    query = query.or(
      `shipping_name.ilike.%${s}%,shipping_email.ilike.%${s}%,order_number.ilike.%${s}%`
    );
    countQuery.or(
      `shipping_name.ilike.%${s}%,shipping_email.ilike.%${s}%,order_number.ilike.%${s}%`
    );
  }

  const statsQuery = adminClient
    .from("orders")
    .select("status, total, archived, created_at");

  const [{ data: orders, error }, { count }, { data: allOrders }] = await Promise.all([
    query,
    countQuery,
    statsQuery,
  ]);

  if (error) {
    return { error: error.message, data: null };
  }

  let stats;
  if (allOrders) {
    const today = new Date().toDateString();
    const needsAttention = allOrders.filter(
      (o) => o.status === "pending" || o.status === "awaiting_payment"
    ).length;
    const revenue = allOrders
      .filter((o) => o.status !== "cancelled" && !o.archived)
      .reduce((s, o) => s + (o.total || 0), 0);
    const todayCount = allOrders.filter(
      (o) => new Date(o.created_at).toDateString() === today
    ).length;
    stats = { needsAttention, revenue, todayCount };
  }

  return {
    error: null,
    data: {
      orders: orders || [],
      total: count || 0,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil((count || 0) / PAGE_SIZE),
      stats,
    },
  };
}
