import { motion } from "framer-motion";

type Props = { score: number; label?: "REAL" | "FAKE" | null };

const ARC_LEN = 251;

export function TrustMeter({ score, label }: Props) {
  const clamped = Math.max(0, Math.min(100, score));
  const rot = -90 + (clamped / 100) * 180;
  const dashOffset = ARC_LEN - (ARC_LEN * clamped) / 100;

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs uppercase tracking-widest text-emerald-400/80 font-semibold">
        Live Trust Score
      </p>
      <div className="relative w-48 h-28">
        <svg viewBox="0 0 200 120" className="w-full h-full drop-shadow-lg">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            opacity={0.35}
          />
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={ARC_LEN}
            strokeDashoffset={dashOffset}
            style={{
              transition: "stroke-dashoffset 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />
          <g transform={`rotate(${rot} 100 100)`}>
            <line x1="100" y1="100" x2="100" y2="35" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
            <circle cx="100" cy="100" r="8" fill="#0f172a" stroke="#22c55e" strokeWidth="2" />
          </g>
        </svg>
      </div>
      <motion.div
        key={clamped}
        initial={{ scale: 0.9, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="font-mono text-3xl font-bold tabular-nums text-white"
      >
        {clamped}
        <span className="text-lg text-slate-400 font-normal">/100</span>
      </motion.div>
      {label && (
        <span
          className={`text-sm font-semibold px-3 py-1 rounded-full ${
            label === "REAL" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
          }`}
        >
          {label === "REAL" ? "Verified Authentic" : "Integrity at risk"}
        </span>
      )}
    </div>
  );
}
