"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  LinkIcon,
  Unlink,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const font = { fontFamily: "Helvetica, Arial, sans-serif" } as const;

type ConnectionInfo = {
  connected: boolean;
  realmId?: string;
  accessTokenExpiresAt?: string;
  refreshTokenExpiresAt?: string;
};

function QBOToastHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    if (success === "true") {
      toast.success("QuickBooks connected successfully");
    } else if (error) {
      toast.error(`Connection failed: ${decodeURIComponent(error)}`);
    }
  }, [searchParams]);

  return null;
}

export default function QBOConnectPage() {
  const [info, setInfo] = useState<ConnectionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetch("/api/qbo/connected")
      .then((r) => r.json())
      .then(setInfo)
      .catch(() => setInfo({ connected: false }))
      .finally(() => setLoading(false));
  }, []);

  const handleDisconnect = async () => {
    if (!confirm("Disconnect QuickBooks? Credit card payments will be unavailable until reconnected.")) return;
    setDisconnecting(true);
    try {
      const res = await fetch("/api/qbo/connected", { method: "DELETE" });
      if (!res.ok) throw new Error();
      setInfo({ connected: false });
      toast.success("QuickBooks disconnected");
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  };

  const refreshExpiry = info?.refreshTokenExpiresAt
    ? new Date(info.refreshTokenExpiresAt)
    : null;
  const daysUntilExpiry = refreshExpiry
    ? Math.ceil((refreshExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const expiryWarning = daysUntilExpiry !== null && daysUntilExpiry < 14;

  return (
    <div
      className="min-h-screen bg-black text-white p-4 md:p-8"
      style={font}
    >
      <Suspense>
        <QBOToastHandler />
      </Suspense>

      <div className="max-w-2xl mx-auto">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight mb-8">
          QuickBooks Online
        </h1>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-white/40" />
          </div>
        ) : info?.connected ? (
          <div className="space-y-6">
            <div className="border border-white/10 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 font-medium">
                  Connected
                </span>
              </div>

              <div className="space-y-3 text-sm text-white/50">
                {info.realmId && (
                  <div className="flex justify-between">
                    <span>Company ID</span>
                    <span className="text-white/70 font-mono text-xs">
                      {info.realmId}
                    </span>
                  </div>
                )}
                {refreshExpiry && (
                  <div className="flex justify-between">
                    <span>Authorization expires</span>
                    <span className="text-white/70">
                      {refreshExpiry.toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {expiryWarning && (
              <div className="border border-amber-400/30 bg-amber-400/5 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-amber-400 font-medium">
                    Re-authorization needed soon
                  </p>
                  <p className="text-white/50 mt-1">
                    Your QuickBooks authorization expires in{" "}
                    {daysUntilExpiry} day{daysUntilExpiry !== 1 ? "s" : ""}.
                    Please reconnect to avoid interruption.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <a
                href="/api/qbo/connect"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reconnect
              </a>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm text-red-400 transition-colors disabled:opacity-50"
              >
                {disconnecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Unlink className="w-4 h-4" />
                )}
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border border-white/10 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-white/30" />
                <span className="text-white/50 font-medium">
                  Not Connected
                </span>
              </div>
              <p className="text-sm text-white/40">
                Connect your QuickBooks Online account to enable credit card
                payments via QBO invoices.
              </p>
            </div>

            <a
              href="/api/qbo/connect"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
              Connect QuickBooks
            </a>
          </div>
        )}

        <div className="mt-8 border border-white/5 rounded-xl p-5 text-sm text-white/30 space-y-2">
          <p className="text-white/50 font-medium">How it works</p>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>
              Connecting QuickBooks enables &quot;Credit Card&quot; as a payment
              method at checkout.
            </li>
            <li>
              When a customer selects credit card, a QBO invoice is created
              automatically and they receive a secure payment link.
            </li>
            <li>
              Once paid, the order is automatically confirmed — no manual
              verification needed.
            </li>
            <li>
              Authorization lasts 100 days. You&apos;ll see a warning when
              it&apos;s time to reconnect.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
