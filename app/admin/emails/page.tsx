"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Plus,
  X,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Info,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const font = { fontFamily: "Helvetica, Arial, sans-serif" } as const;

type EmailSetting = {
  id: string;
  label: string;
  description: string;
  recipients: string[];
  enabled: boolean;
  updated_at: string;
};

export default function EmailSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<EmailSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [newEmails, setNewEmails] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { app_metadata?: Record<string, string> } | null } }) => {
      if (!user || user.app_metadata?.role !== "admin") {
        router.push("/portal");
      }
    });
  }, [router]);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/email-settings");
      if (!res.ok) {
        toast.error("Failed to load email settings");
        return;
      }
      const data = await res.json();
      setSettings(data.settings || []);
    } catch {
      toast.error("Failed to load email settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const toggleEnabled = async (setting: EmailSetting) => {
    const newEnabled = !setting.enabled;
    setSavingId(setting.id);
    setSettings((prev) =>
      prev.map((s) => (s.id === setting.id ? { ...s, enabled: newEnabled } : s))
    );
    try {
      const res = await fetch("/api/admin/email-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: setting.id, enabled: newEnabled }),
      });
      if (res.ok) {
        toast.success(newEnabled ? "Email enabled" : "Email disabled");
      } else {
        setSettings((prev) =>
          prev.map((s) => (s.id === setting.id ? { ...s, enabled: !newEnabled } : s))
        );
        toast.error("Failed to update setting");
      }
    } catch {
      setSettings((prev) =>
        prev.map((s) => (s.id === setting.id ? { ...s, enabled: !newEnabled } : s))
      );
      toast.error("Failed to update setting");
    } finally {
      setSavingId(null);
    }
  };

  const removeRecipient = async (settingId: string, email: string) => {
    const setting = settings.find((s) => s.id === settingId);
    if (!setting) return;

    const updated = setting.recipients.filter((r) => r !== email);
    setSavingId(settingId);
    try {
      const res = await fetch("/api/admin/email-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: settingId, recipients: updated }),
      });
      if (res.ok) {
        setSettings((prev) =>
          prev.map((s) => (s.id === settingId ? { ...s, recipients: updated } : s))
        );
        toast.success("Recipient removed");
      } else {
        toast.error("Failed to remove recipient");
      }
    } catch {
      toast.error("Failed to remove recipient");
    } finally {
      setSavingId(null);
    }
  };

  const addRecipient = async (settingId: string) => {
    const email = (newEmails[settingId] || "").trim().toLowerCase();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors((prev) => ({ ...prev, [settingId]: "Invalid email address" }));
      return;
    }

    const setting = settings.find((s) => s.id === settingId);
    if (!setting) return;

    if (setting.recipients.includes(email)) {
      setErrors((prev) => ({ ...prev, [settingId]: "Email already added" }));
      return;
    }

    const updated = [...setting.recipients, email];
    setSavingId(settingId);
    setErrors((prev) => ({ ...prev, [settingId]: "" }));

    try {
      const res = await fetch("/api/admin/email-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: settingId, recipients: updated }),
      });
      if (res.ok) {
        setSettings((prev) =>
          prev.map((s) => (s.id === settingId ? { ...s, recipients: updated } : s))
        );
        setNewEmails((prev) => ({ ...prev, [settingId]: "" }));
        toast.success("Recipient added");
      } else {
        toast.error("Failed to add recipient");
      }
    } catch {
      toast.error("Failed to add recipient");
    } finally {
      setSavingId(null);
    }
  };

  const isCustomerEmail = (id: string) =>
    ["order_received", "order_confirmed", "order_shipped"].includes(id);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            href="/admin"
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-white/60" />
          </Link>
          <div>
            <h1 style={font} className="text-2xl font-normal tracking-tight">
              Email Settings
            </h1>
            <p style={font} className="text-sm text-white/40 mt-1">
              Manage which emails get sent where across the site
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
          </div>
        ) : (
        <div className="flex flex-col gap-6">
          {settings.map((setting) => (
            <div
              key={setting.id}
              className={`rounded-xl border transition-colors ${
                setting.enabled
                  ? "bg-white/[0.02] border-white/10"
                  : "bg-white/[0.01] border-white/5 opacity-60"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 text-white/50" />
                  </div>
                  <div>
                    <h3 style={font} className="text-base font-medium text-white">
                      {setting.label}
                    </h3>
                    <p style={font} className="text-xs text-white/40 mt-1">
                      {setting.description}
                    </p>
                    {isCustomerEmail(setting.id) && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Info className="w-3 h-3 text-blue-400/60" />
                        <span style={font} className="text-[10px] text-blue-400/60 uppercase tracking-wider">
                          Primary recipient is always the customer. Emails below receive a CC copy.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleEnabled(setting)}
                    disabled={savingId === setting.id}
                    className="shrink-0"
                  >
                    {setting.enabled ? (
                      <ToggleRight className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-white/20" />
                    )}
                  </button>
                </div>
              </div>

              {/* Recipients */}
              {setting.enabled && (
                <div className="px-6 pb-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {setting.recipients.map((email) => (
                      <div
                        key={email}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 group"
                      >
                        <span style={font} className="text-xs text-white/70">
                          {email}
                        </span>
                        <button
                          onClick={() => removeRecipient(setting.id, email)}
                          disabled={savingId === setting.id}
                          className="text-white/20 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {setting.recipients.length === 0 && !isCustomerEmail(setting.id) && (
                      <span style={font} className="text-xs text-white/20 italic">
                        No recipients — emails will not be sent
                      </span>
                    )}
                    {setting.recipients.length === 0 && isCustomerEmail(setting.id) && (
                      <span style={font} className="text-xs text-white/20 italic">
                        No CC recipients — only the customer receives this email
                      </span>
                    )}
                  </div>

                  {/* Add new recipient */}
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={newEmails[setting.id] || ""}
                      onChange={(e) => {
                        setNewEmails((prev) => ({ ...prev, [setting.id]: e.target.value }));
                        setErrors((prev) => ({ ...prev, [setting.id]: "" }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addRecipient(setting.id);
                        }
                      }}
                      placeholder="Add email address..."
                      style={font}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-white text-xs focus:outline-none focus:border-white/30 transition-colors placeholder:text-white/15"
                    />
                    <button
                      onClick={() => addRecipient(setting.id)}
                      disabled={savingId === setting.id || !(newEmails[setting.id] || "").trim()}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {savingId === setting.id ? (
                        <Loader2 className="w-3 h-3 animate-spin text-white/40" />
                      ) : (
                        <Plus className="w-3 h-3 text-white/60" />
                      )}
                      <span style={font} className="text-xs text-white/60">
                        Add
                      </span>
                    </button>
                  </div>
                  {errors[setting.id] && (
                    <p style={font} className="text-xs text-red-400 mt-2">
                      {errors[setting.id]}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
