import type { FormEvent } from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleCard } from "@/components/vic-onboarding/RoleCard";
import { VisibilityToggle } from "@/components/vic-onboarding/VisibilityToggle";
import { saveApplyDraft, type VicApplyRole } from "@/services/vicOnboarding";

export default function Apply() {
  const navigate = useNavigate();
  const [role, setRole] = useState<VicApplyRole>("VIC Host");
  const [discoverable, setDiscoverable] = useState(true);
  const [membersClub, setMembersClub] = useState("");
  const [canHostAtClub, setCanHostAtClub] = useState(false);
  const [invitationCode, setInvitationCode] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    saveApplyDraft({
      Role: role,
      discoverable,
      MembersClub: membersClub.trim() || undefined,
      CanHostAtClub: membersClub.trim() ? canHostAtClub : undefined,
      InvitationCode: invitationCode.trim() || undefined,
    });

    navigate("/apply/thanks");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ffffff_0%,#f4f4f5_42%,#f1f5f9_100%)] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/60 bg-white/65 p-7 shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-2xl"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">VIC Curated Access</p>
        <h1 className="mt-3 text-3xl font-semibold text-neutral-900">Apply as a host</h1>
        <p className="mt-2 text-sm text-neutral-500">Choose your role and visibility preference to request access.</p>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <div className="space-y-3">
            <Label className="text-xs font-medium text-neutral-600">Role</Label>
            <RoleCard
              title="VIC Host"
              description="Create elevated experiences and host curated social activities."
              selected={role === "VIC Host"}
              onClick={() => setRole("VIC Host")}
            />
            <RoleCard
              title="Philanthropist"
              description="Support community initiatives while participating in private experiences."
              selected={role === "Philanthropist"}
              onClick={() => setRole("Philanthropist")}
            />
          </div>

          <VisibilityToggle discoverable={discoverable} onChange={setDiscoverable} />

          <div className="space-y-2">
            <Label className="text-xs font-medium text-neutral-600">Members Club affiliation (optional)</Label>
            <Input
              className="rounded-2xl border-neutral-200 bg-white/90"
              placeholder="e.g. Soho House Madrid"
              value={membersClub}
              onChange={(event) => {
                const value = event.target.value;
                setMembersClub(value);
                if (!value.trim()) {
                  setCanHostAtClub(false);
                }
              }}
            />
            <label className="flex items-center gap-2 text-sm text-neutral-600">
              <input
                type="checkbox"
                disabled={!membersClub.trim()}
                checked={canHostAtClub}
                onChange={(event) => setCanHostAtClub(event.target.checked)}
                className="h-4 w-4 rounded border-neutral-300"
              />
              I can host activities at this club
            </label>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-neutral-600">Invitation code (optional)</Label>
            <Input
              className="rounded-2xl border-neutral-200 bg-white/90"
              placeholder="Enter invitation code"
              value={invitationCode}
              onChange={(event) => setInvitationCode(event.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
          >
            Request access
          </button>
        </form>
      </motion.div>
    </div>
  );
}
