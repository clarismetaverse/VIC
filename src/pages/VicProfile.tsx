import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronLeft, Diamond, Images, LogOut, Mail, Pencil, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const easeOut = { duration: 0.35, ease: [0.22, 0.61, 0.36, 1] };

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "V";

  const first = parts[0]?.[0] ?? "V";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

export default function VicProfile() {
  const navigate = useNavigate();
  const { user, isLoading, logout } = useAuth();

  const avatarUrl = user?.Picture?.url ?? "";
  const displayName = user?.Name?.trim() || "VIC Member";
  const bio = (user?.bio ?? "").trim();
  const email = user?.email?.trim() || "—";

  const diamonds = user?.Diamonds ?? 0;
  const invites = user?.Invites ?? 0;

  const subtitle = useMemo(() => {
    if (!user) return "VIC";
    return "VIC Member";
  }, [user]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0B0B0F]">
      <div className="sticky top-0 z-20 border-b border-neutral-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-[0_10px_25px_rgba(0,0,0,0.06)] active:scale-95"
            aria-label="Go back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="text-center">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-neutral-400">PROFILE</p>
            <h1 className="text-sm font-semibold text-neutral-900">VIC</h1>
          </div>

          <div className="h-9 w-9" />
        </div>
      </div>

      <main className="mx-auto w-full max-w-md px-4 pb-16 pt-6">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
              transition={easeOut}
              className="space-y-4"
            >
              <div className="h-40 rounded-3xl border border-neutral-200 bg-white shadow-[0_12px_34px_rgba(0,0,0,0.06)]" />
              <div className="h-28 rounded-3xl border border-neutral-200 bg-white shadow-[0_12px_34px_rgba(0,0,0,0.06)]" />
              <div className="h-28 rounded-3xl border border-neutral-200 bg-white shadow-[0_12px_34px_rgba(0,0,0,0.06)]" />
            </motion.div>
          ) : (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={easeOut}
              className="space-y-5"
            >
              <motion.section
                initial={{ opacity: 0, y: 12, scale: 0.98, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                transition={{ ...easeOut, delay: 0.05 }}
                className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-5 shadow-[0_18px_48px_rgba(0,0,0,0.10)]"
              >
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#FF5A7A]/10 blur-3xl" />
                  <div className="absolute -right-20 -bottom-24 h-72 w-72 rounded-full bg-[#7C5CFF]/10 blur-3xl" />
                </div>

                <div className="relative -mx-5 -mt-5">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-72 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-72 w-full items-center justify-center bg-neutral-100 text-3xl font-semibold text-neutral-400">
                      {initials(displayName)}
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => window.alert("Gallery coming soon.")}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-[0_8px_20px_rgba(0,0,0,0.12)] backdrop-blur active:scale-95"
                      aria-label="Gallery"
                    >
                      <Images className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => window.alert("Edit profile endpoint coming soon.")}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow-[0_8px_20px_rgba(0,0,0,0.12)] backdrop-blur active:scale-95"
                      aria-label="Edit profile"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <h2 className="truncate text-xl font-semibold text-neutral-900">{displayName}</h2>
                  <p className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
                    <Sparkles className="h-4 w-4 text-neutral-400" />
                    {subtitle}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
                      <Diamond className="h-3.5 w-3.5 text-[#FF5A7A]" />
                      {diamonds.toLocaleString()} Diamonds
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
                      <CalendarDays className="h-3.5 w-3.5 text-neutral-500" />
                      {invites.toLocaleString()} Invites
                    </span>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 12, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ ...easeOut, delay: 0.08 }}
                className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-[0_12px_34px_rgba(0,0,0,0.06)]"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-900">Bio</h3>
                  <span className="text-[11px] font-semibold tracking-[0.14em] text-neutral-400">ABOUT</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                  {bio || "Add a short bio to help venues understand your vibe and style."}
                </p>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 12, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ ...easeOut, delay: 0.11 }}
                className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-[0_12px_34px_rgba(0,0,0,0.06)]"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-900">Account</h3>
                  <span className="text-[11px] font-semibold tracking-[0.14em] text-neutral-400">SECURITY</span>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-[#FAFAFA] px-4 py-3">
                  <Mail className="h-4 w-4 text-neutral-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-neutral-600">Email</p>
                    <p className="truncate text-sm text-neutral-900">{email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition-transform active:scale-[0.99]"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
