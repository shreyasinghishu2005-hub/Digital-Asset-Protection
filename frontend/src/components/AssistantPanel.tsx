import { useCallback, useEffect, useId, useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import * as api from "../lib/api";
import type { AnalyzeResult } from "../lib/api";

type Props = {
  result: AnalyzeResult | null;
  piracyDuplicate: boolean;
  assistantMode: "gemini" | "fallback" | null;
};

export function AssistantPanel({ result, piracyDuplicate, assistantMode }: Props) {
  const [text, setText] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const headingId = useId();
  const regionId = useId();

  const load = useCallback(
    async (q?: string) => {
      if (!result) return;
      setLoading(true);
      setError(null);
      try {
        const r = await api.assistantInsight({
          label: result.label,
          confidence: result.confidence,
          trust_score: result.trust_score,
          filename: result.filename,
          user_question: q?.trim() || undefined,
          piracy_duplicate: piracyDuplicate,
        });
        setText(r.text);
        setSource(r.source);
      } catch {
        setError("Could not load assistant insight. Is the API running?");
      } finally {
        setLoading(false);
      }
    },
    [result, piracyDuplicate]
  );

  useEffect(() => {
    if (!result) {
      setText(null);
      setSource(null);
      setQuestion("");
      return;
    }
    void load();
  }, [result, piracyDuplicate, load]);

  if (!result) return null;

  return (
    <section
      className="glass p-6 border-violet-500/25"
      aria-labelledby={headingId}
      id={regionId}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 id={headingId} className="text-lg font-bold flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-violet-400" aria-hidden />
          Smart assistant
        </h3>
        {assistantMode && (
          <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-white/10 text-slate-300">
            {assistantMode === "gemini" ? "Google Gemini" : "Offline narrative"}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 mb-3">
        Explanations adapt to verdict, trust score, filename, and piracy context. With{" "}
        <code className="text-emerald-400/90">GEMINI_API_KEY</code> on the server, responses use Google Gemini;
        otherwise a safe template runs for demos.
      </p>

      <div
        className="min-h-[4rem] rounded-lg border border-white/10 bg-black/25 p-4 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap"
        role="status"
        aria-live="polite"
        aria-busy={loading}
      >
        {loading && (
          <span className="inline-flex items-center gap-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            Generating insight…
          </span>
        )}
        {!loading && error && <span className="text-rose-300">{error}</span>}
        {!loading && !error && text && (
          <>
            {text}
            {source && (
              <span className="block mt-3 text-[10px] uppercase tracking-wider text-slate-500">
                Source: {source === "gemini" ? "Google Gemini" : "Template fallback"}
              </span>
            )}
          </>
        )}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <label htmlFor="assistant-followup" className="sr-only">
          Optional follow-up question for the assistant
        </label>
        <input
          id="assistant-followup"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a follow-up (e.g. What should our MCR do next?)"
          className="flex-1 rounded-lg bg-black/30 border border-white/15 px-3 py-2 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        />
        <button
          type="button"
          disabled={loading}
          onClick={() => void load(question)}
          className="px-4 py-2 rounded-lg bg-violet-600/50 hover:bg-violet-600/70 disabled:opacity-40 text-sm font-medium"
        >
          Ask with context
        </button>
      </div>
    </section>
  );
}
