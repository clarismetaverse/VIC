import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function ApplyThanks() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#ffffff_0%,#f4f4f5_42%,#f1f5f9_100%)] p-6">
      <motion.div
        initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-lg rounded-[2rem] border border-white/70 bg-white/70 p-9 text-center shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-2xl"
      >
        <h1 className="text-3xl font-semibold text-neutral-900">Application received</h1>
        <p className="mt-3 text-sm text-neutral-500">Access is curated. We’ll review and get back shortly.</p>

        <div className="mt-8 space-y-3">
          <Link
            to="/register"
            className="block w-full rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
          >
            Continue to create account
          </Link>
          <Link
            to="/login"
            className="block w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700"
          >
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
