import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export type ToastKind = "fake" | "real" | "piracy" | "chain" | null;

type Props = { kind: ToastKind; message?: string };

export function ToastAlerts({ kind, message }: Props) {
  return (
    <AnimatePresence>
      {kind === "fake" && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          role="status"
          aria-live="polite"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] glass px-6 py-4 border-rose-500/40 shadow-glowRed flex items-center gap-3"
        >
          <AlertTriangle className="w-8 h-8 text-rose-400 shrink-0" />
          <div>
            <p className="font-bold text-lg text-rose-100">Fake Detected 🚨</p>
            <p className="text-sm text-rose-200/80">Heatmap highlights suspected tampering zones.</p>
          </div>
        </motion.div>
      )}
      {kind === "real" && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          role="status"
          aria-live="polite"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] glass px-6 py-4 border-emerald-500/40 shadow-glow flex items-center gap-3"
        >
          <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold text-lg text-emerald-100">Verified Authentic ✅</p>
            <p className="text-sm text-emerald-200/80">Trust score reflects high media integrity.</p>
          </div>
        </motion.div>
      )}
      {kind === "piracy" && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          role="status"
          aria-live="polite"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] glass px-6 py-4 border-amber-500/40 flex items-center gap-3 max-w-md"
        >
          <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
          <div>
            <p className="font-bold text-lg text-amber-100">⚠️ Possible Piracy Detected</p>
            <p className="text-sm text-amber-200/90">{message}</p>
          </div>
        </motion.div>
      )}
      {kind === "chain" && message && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          role="status"
          aria-live="polite"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] glass px-6 py-4 border-cyan-500/30 flex items-center gap-3 max-w-lg"
        >
          <CheckCircle2 className="w-7 h-7 text-cyan-400 shrink-0" />
          <p className="text-sm text-cyan-50">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
