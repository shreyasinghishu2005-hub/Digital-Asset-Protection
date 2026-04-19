const base = "";

export type AnalyzeResult = {
  filename: string;
  label: "REAL" | "FAKE";
  confidence: number;
  trust_score: number;
  heatmap_png_base64: string;
  media_hash: string;
};

export async function analyzeFile(
  file: File,
  demoCase?: "real" | "fake" | "edited"
): Promise<AnalyzeResult> {
  const fd = new FormData();
  fd.append("file", file);
  if (demoCase) fd.append("demo_case", demoCase);
  const r = await fetch(`${base}/api/analyze`, { method: "POST", body: fd });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function generateFake(file: File): Promise<Blob> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch(`${base}/api/generate-fake`, { method: "POST", body: fd });
  if (!r.ok) throw new Error(await r.text());
  return r.blob();
}

export async function watermark(file: File): Promise<Blob> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch(`${base}/api/watermark`, { method: "POST", body: fd });
  if (!r.ok) throw new Error(await r.text());
  return r.blob();
}

export async function chainRegister(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch(`${base}/api/blockchain/register`, { method: "POST", body: fd });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{
    status: string;
    transaction_id: string;
    timestamp: number;
    media_hash: string;
  }>;
}

export async function chainVerify(file: File, registeredHash?: string) {
  const fd = new FormData();
  fd.append("file", file);
  if (registeredHash) fd.append("registered_hash", registeredHash);
  const r = await fetch(`${base}/api/blockchain/verify`, { method: "POST", body: fd });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{
    result: string;
    detail?: string;
    transaction_id?: string;
    timestamp?: number;
    media_hash?: string;
    uploaded_hash?: string;
    expected_hash?: string;
  }>;
}

export async function piracyCheck(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch(`${base}/api/piracy-check`, { method: "POST", body: fd });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{
    media_hash: string;
    duplicate: boolean;
    message: string;
    detail?: string;
  }>;
}

export async function piracyReset() {
  await fetch(`${base}/api/piracy/reset`, { method: "POST" });
}

export async function downloadReport(file: File, demoCase?: string) {
  const fd = new FormData();
  fd.append("file", file);
  if (demoCase) fd.append("demo_case", demoCase);
  const r = await fetch(`${base}/api/report`, { method: "POST", body: fd });
  if (!r.ok) throw new Error(await r.text());
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sportshield-report.txt";
  a.click();
  URL.revokeObjectURL(url);
}
