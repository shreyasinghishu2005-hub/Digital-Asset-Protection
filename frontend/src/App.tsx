import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Download,
  Droplets,
  Fingerprint,
  Link2,
  Loader2,
  Radio,
  Shield,
  Sparkles,
  SplitSquareHorizontal,
  Upload,
  Zap,
} from "lucide-react";
import { TrustMeter } from "./components/TrustMeter";
import { ToastAlerts, type ToastKind } from "./components/ToastAlerts";
import * as api from "./lib/api";
import type { AnalyzeResult } from "./lib/api";

function blobToFile(blob: Blob, name: string): File {
  return new File([blob], name, { type: blob.type || "image/png" });
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [trustScore, setTrustScore] = useState(72);
  const [label, setLabel] = useState<"REAL" | "FAKE" | null>(null);
  const [toast, setToast] = useState<ToastKind>(null);
  const [toastMsg, setToastMsg] = useState<string | undefined>();
  const [demoCase, setDemoCase] = useState<"real" | "fake" | "edited" | undefined>();

  const [fakeBlobUrl, setFakeBlobUrl] = useState<string | null>(null);
  const [wmBlobUrl, setWmBlobUrl] = useState<string | null>(null);
  const [tamperedWmUrl, setTamperedWmUrl] = useState<string | null>(null);

  const [registeredHash, setRegisteredHash] = useState<string | null>(null);
  const [chainLog, setChainLog] = useState<string[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camActive, setCamActive] = useState(false);

  const heatmapSrc = useMemo(() => {
    if (!result?.heatmap_png_base64) return null;
    return `data:image/png;base64,${result.heatmap_png_base64}`;
  }, [result]);

  const clearToastSoon = useCallback((k: ToastKind) => {
    setToast(k);
    setTimeout(() => setToast(null), 4200);
  }, []);

  const runAnalyze = useCallback(
    async (f: File, dc?: "real" | "fake" | "edited") => {
      setLoading(true);
      try {
        const r = await api.analyzeFile(f, dc);
        setResult(r);
        setTrustScore(r.trust_score);
        setLabel(r.label);
        clearToastSoon(r.label === "FAKE" ? "fake" : "real");
        try {
          const p = await api.piracyCheck(f);
          if (p.duplicate) {
            setToast("piracy");
            setToastMsg(p.detail || p.message);
            setTimeout(() => setToast(null), 5200);
          }
        } catch {
          /* optional */
        }
      } catch (e) {
        console.error(e);
        alert("Analysis failed — is the API running on port 8000?");
      } finally {
        setLoading(false);
      }
    },
    [clearToastSoon]
  );

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const u = URL.createObjectURL(file);
    setPreviewUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) {
        setFile(f);
        setFakeBlobUrl(null);
        setResult(null);
        setDemoCase(undefined);
      }
    },
    []
  );

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setFakeBlobUrl(null);
      setResult(null);
      setDemoCase(undefined);
    }
  };

  const loadDemoAsset = async (path: string, caseKey: "real" | "fake" | "edited", filename: string) => {
    setLoading(true);
    try {
      const res = await fetch(path);
      const blob = await res.blob();
      const f = blobToFile(blob, filename);
      setFile(f);
      setDemoCase(caseKey);
      setFakeBlobUrl(null);
      await runAnalyze(f, caseKey);
    } catch {
      alert("Demo samples missing — run scripts/generate_demo_samples.py then refresh.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeClick = () => {
    if (!file) return;
    runAnalyze(file, demoCase);
  };

  const handleGenerateFake = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const blob = await api.generateFake(file);
      const url = URL.createObjectURL(blob);
      if (fakeBlobUrl) URL.revokeObjectURL(fakeBlobUrl);
      setFakeBlobUrl(url);
      const fakeFile = blobToFile(blob, `fake-${file.name}.png`);
      await runAnalyze(fakeFile, undefined);
    } catch (e) {
      console.error(e);
      alert("Generate fake failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleWatermark = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const blob = await api.watermark(file);
      const url = URL.createObjectURL(blob);
      if (wmBlobUrl) URL.revokeObjectURL(wmBlobUrl);
      setWmBlobUrl(url);
      setTamperedWmUrl(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const simulateTamperOnWatermark = async () => {
    if (!wmBlobUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = wmBlobUrl;
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("image load"));
    });
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(img.width * 0.2, img.height * 0.2, img.width * 0.35, img.height * 0.25);
    const blob = await new Promise<Blob | null>((res) => c.toBlob((b) => res(b), "image/png"));
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    if (tamperedWmUrl) URL.revokeObjectURL(tamperedWmUrl);
    setTamperedWmUrl(url);
    const f = blobToFile(blob, "tampered-watermark.png");
    await runAnalyze(f);
    setToast("chain");
    setToastMsg("Watermark forensic pattern still traceable — mismatch flagged on tampered pixels (demo).");
    setTimeout(() => setToast(null), 4500);
  };

  const registerChain = async () => {
    if (!file) return;
    try {
      const r = await api.chainRegister(file);
      setRegisteredHash(r.media_hash);
      setChainLog((l) => [
        ...l,
        `${r.status} — tx ${r.transaction_id.slice(0, 18)}… @ ${new Date(r.timestamp * 1000).toISOString()}`,
      ]);
      setToast("chain");
      setToastMsg("Media Registered Successfully — hash anchored (simulated ledger).");
      setTimeout(() => setToast(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const verifyChain = async (sameFile: boolean) => {
    try {
      if (sameFile && file) {
        const r = await api.chainVerify(file, registeredHash ?? undefined);
        setChainLog((l) => [...l, `Verify: ${r.result}`]);
        setToast("chain");
        setToastMsg(r.result + (r.transaction_id ? ` — ${r.transaction_id.slice(0, 14)}…` : ""));
        setTimeout(() => setToast(null), 4000);
      } else if (!sameFile && file) {
        const tiny = new Blob([file.name + "-edited"], { type: "text/plain" });
        const edited = blobToFile(tiny, "edited-placeholder.txt");
        const r = await api.chainVerify(edited, registeredHash ?? undefined);
        setChainLog((l) => [...l, `Verify edited: ${r.result}`]);
        setToast("chain");
        setToastMsg(r.result === "Mismatch Detected" ? "Mismatch Detected — hash differs from registry." : r.result);
        setTimeout(() => setToast(null), 4500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
      setCamActive(true);
    } catch {
      alert("Camera access denied or unavailable.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamActive(false);
  };

  const captureAndAnalyze = async () => {
    const v = videoRef.current;
    const canvas = canvasRef.current;
    if (!v || !canvas) return;
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(v, 0, 0);
    await new Promise<void>((res) =>
      canvas.toBlob(async (b) => {
        if (!b) return res();
        const f = blobToFile(b, "camera-frame.png");
        setFile(f);
        await runAnalyze(f);
        res();
      }, "image/png")
    );
  };

  const resetPiracy = async () => {
    await api.piracyReset();
    setChainLog((l) => [...l, "Piracy session counters reset."]);
  };

  return (
    <div className="min-h-screen pb-24">
      <ToastAlerts kind={toast} message={toastMsg} />

      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-700 flex items-center justify-center shadow-glow">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white">SportShield Pro</h1>
              <p className="text-xs text-emerald-400/90 font-medium">AI protection for digital sports media</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            Real-time demo visualization
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-10 grid lg:grid-cols-12 gap-8">
        {/* Left column: upload + results */}
        <section className="lg:col-span-7 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 border-emerald-500/20"
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-400" />
                Upload & analyze
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => loadDemoAsset("/samples/demo-real.png", "real", "demo-real.png")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/30 transition"
                >
                  Demo: Real
                </button>
                <button
                  type="button"
                  onClick={() => loadDemoAsset("/samples/demo-fake.png", "fake", "demo-fake.png")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/30 transition"
                >
                  Demo: Deepfake
                </button>
                <button
                  type="button"
                  onClick={() => loadDemoAsset("/samples/demo-edited.png", "edited", "demo-edited.png")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/30 transition"
                >
                  Demo: Edited
                </button>
              </div>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className="border-2 border-dashed border-white/20 rounded-xl p-10 text-center hover:border-emerald-500/50 transition-colors cursor-pointer relative overflow-hidden group"
            >
              <input type="file" accept="image/*,video/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={onFileInput} />
              <Sparkles className="w-10 h-10 mx-auto text-emerald-400/80 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-slate-200">Drag & drop sports image or clip</p>
              <p className="text-sm text-slate-500 mt-1">Instant analysis in seconds · heatmap proof</p>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <button
                type="button"
                disabled={!file || loading}
                onClick={handleAnalyzeClick}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 font-semibold transition shadow-glow"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                Run detection
              </button>
              <button
                type="button"
                disabled={!file || loading}
                onClick={() => file && api.downloadReport(file, demoCase)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 font-medium"
              >
                <Download className="w-4 h-4" />
                Auto report
              </button>
              <button
                type="button"
                disabled={!file || loading}
                onClick={handleGenerateFake}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/40 hover:bg-rose-600/60 border border-rose-500/40 font-medium"
              >
                <Sparkles className="w-4 h-4" />
                Generate Fake (demo)
              </button>
            </div>
          </motion.div>

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-6 grid md:grid-cols-2 gap-6"
            >
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Verdict</p>
                <div className="flex items-baseline gap-3">
                  <span
                    className={`text-4xl font-black ${result.label === "REAL" ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    {result.label}
                  </span>
                  <span className="text-slate-400 font-mono">{result.confidence}% confidence</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-mono break-all">SHA-256: {result.media_hash.slice(0, 24)}…</p>
              </div>
              <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/40">
                {heatmapSrc && (
                  <img src={heatmapSrc} alt="Heatmap overlay" className="w-full h-full object-contain" />
                )}
                <span className="absolute bottom-2 left-2 text-[10px] uppercase tracking-widest bg-black/60 px-2 py-1 rounded">
                  Tamper heatmap
                </span>
              </div>
            </motion.div>
          )}

          {/* Before / After */}
          <div className="glass p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <SplitSquareHorizontal className="w-5 h-5 text-cyan-400" />
              Before vs After
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/30 aspect-video flex items-center justify-center">
                {previewUrl ? (
                  file?.type.startsWith("video") ? (
                    <video src={previewUrl} className="max-h-56 w-full object-contain" controls muted />
                  ) : (
                    <img src={previewUrl} alt="Original" className="max-h-56 w-full object-contain" />
                  )
                ) : (
                  <span className="text-slate-500 text-sm">Original media</span>
                )}
                <span className="absolute bottom-2 left-2 text-[10px] uppercase bg-black/50 px-2 py-0.5 rounded text-emerald-300">
                  Original
                </span>
              </div>
              <div className="relative rounded-xl overflow-hidden border border-rose-500/30 bg-black/30 aspect-video flex items-center justify-center">
                {fakeBlobUrl ? (
                  <img src={fakeBlobUrl} alt="Tampered" className="max-h-56 w-full object-contain" />
                ) : (
                  <span className="text-slate-500 text-sm text-center px-4">
                    Run &quot;Generate Fake&quot; to see a tampered version, then detection runs automatically.
                  </span>
                )}
                <span className="absolute bottom-2 left-2 text-[10px] uppercase bg-black/50 px-2 py-0.5 rounded text-rose-300">
                  Tampered / deepfake
                </span>
              </div>
            </div>
          </div>

          {/* Watermark */}
          <div className="glass p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Droplets className="w-5 h-5 text-sky-400" />
              Watermark demo
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-lg border border-white/10 overflow-hidden aspect-video bg-black/40 flex items-center justify-center">
                {previewUrl && !file?.type.startsWith("video") ? (
                  <img src={previewUrl} alt="" className="max-h-40 object-contain" />
                ) : (
                  <span className="text-xs text-slate-500">Original still</span>
                )}
              </div>
              <div className="rounded-lg border border-sky-500/30 overflow-hidden aspect-video bg-black/40 flex items-center justify-center">
                {wmBlobUrl ? (
                  <img src={wmBlobUrl} alt="Watermarked" className="max-h-40 object-contain" />
                ) : (
                  <span className="text-xs text-slate-500">Watermarked output</span>
                )}
              </div>
              <div className="rounded-lg border border-amber-500/30 overflow-hidden aspect-video bg-black/40 flex items-center justify-center">
                {tamperedWmUrl ? (
                  <img src={tamperedWmUrl} alt="Tampered" className="max-h-40 object-contain" />
                ) : (
                  <span className="text-xs text-slate-500">After simulated tamper</span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                type="button"
                disabled={!file || loading || file?.type.startsWith("video")}
                onClick={handleWatermark}
                className="px-4 py-2 rounded-lg bg-sky-600/50 hover:bg-sky-600/70 font-medium disabled:opacity-40"
              >
                Embed Watermark
              </button>
              <button
                type="button"
                disabled={!wmBlobUrl || loading}
                onClick={simulateTamperOnWatermark}
                className="px-4 py-2 rounded-lg bg-amber-600/40 hover:bg-amber-600/60 font-medium disabled:opacity-40"
              >
                Simulate tampering
              </button>
            </div>
          </div>

          {/* Blockchain */}
          <div className="glass p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Link2 className="w-5 h-5 text-violet-400" />
              Blockchain verification (simulated)
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <button type="button" disabled={!file} onClick={registerChain} className="px-4 py-2 rounded-lg bg-violet-600/50 hover:bg-violet-600/70 font-medium disabled:opacity-40">
                Register media
              </button>
              <button
                type="button"
                disabled={!file || !registeredHash}
                onClick={() => verifyChain(true)}
                className="px-4 py-2 rounded-lg bg-emerald-600/40 font-medium disabled:opacity-40"
              >
                Verify same file
              </button>
              <button
                type="button"
                disabled={!registeredHash}
                onClick={() => verifyChain(false)}
                className="px-4 py-2 rounded-lg bg-rose-600/40 font-medium disabled:opacity-40"
              >
                Verify edited / wrong file
              </button>
            </div>
            <ul className="font-mono text-xs text-slate-400 space-y-1 max-h-32 overflow-y-auto border border-white/5 rounded-lg p-3 bg-black/20">
              {chainLog.length === 0 ? <li>No events yet.</li> : chainLog.map((l, i) => <li key={i}>{l}</li>)}
            </ul>
          </div>

          {/* Camera + Piracy */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass p-6">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                <Camera className="w-5 h-5 text-pink-400" />
                Live camera verify
              </h3>
              <video ref={videoRef} className="w-full rounded-lg bg-black aspect-video object-cover border border-white/10" playsInline muted />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-2 mt-3">
                {!camActive ? (
                  <button type="button" onClick={startCamera} className="px-4 py-2 rounded-lg bg-pink-600/50 hover:bg-pink-600/70 font-medium">
                    Start webcam
                  </button>
                ) : (
                  <>
                    <button type="button" onClick={captureAndAnalyze} className="px-4 py-2 rounded-lg bg-emerald-600/60 font-medium">
                      Capture & scan
                    </button>
                    <button type="button" onClick={stopCamera} className="px-4 py-2 rounded-lg bg-white/10 font-medium">
                      Stop
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="glass p-6">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                <Fingerprint className="w-5 h-5 text-amber-400" />
                Piracy simulation
              </h3>
              <p className="text-sm text-slate-400 mb-3">
                Upload the same file twice — the second hit triggers a duplicate alert (session-based demo).
              </p>
              <button type="button" onClick={resetPiracy} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm">
                Reset piracy session
              </button>
            </div>
          </div>
        </section>

        {/* Right column: trust meter */}
        <aside className="lg:col-span-5 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-8 sticky top-24 border-emerald-500/25"
          >
            <TrustMeter score={trustScore} label={label} />
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-sm text-slate-400 leading-relaxed">
                SportShield Pro combines perceptual hashing, forensic overlays, and ledger-style registration to
                visualize how leagues and broadcasters can defend clips against deepfakes, tampering, and unauthorized
                redistribution — optimized for <span className="text-emerald-400/90">live demo storytelling</span>.
              </p>
            </div>
          </motion.div>
        </aside>
      </main>
    </div>
  );
}
