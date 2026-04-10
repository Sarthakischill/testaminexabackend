import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/qbo";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const realmId = searchParams.get("realmId");
  const error = searchParams.get("error");

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(
      `${baseUrl}/admin/qbo-connect?error=${encodeURIComponent(error)}`
    );
  }

  if (!code || !realmId) {
    return NextResponse.redirect(
      `${baseUrl}/admin/qbo-connect?error=missing_params`
    );
  }

  try {
    await exchangeCode(code, realmId);
    return NextResponse.redirect(
      `${baseUrl}/admin/qbo-connect?success=true`
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("QBO callback error:", msg);
    return NextResponse.redirect(
      `${baseUrl}/admin/qbo-connect?error=${encodeURIComponent(msg)}`
    );
  }
}
