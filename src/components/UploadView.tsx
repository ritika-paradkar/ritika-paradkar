import { useState, useCallback } from "react";
import { Upload, FileText, Image, Video, CheckCircle, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getVerificationResult, getMockAnalysis, type VerificationStatus } from "@/lib/mockData";
import { Button } from "@/components/ui/button";

const statusConfig: Record<VerificationStatus, { icon: typeof CheckCircle; label: string; class: string }> = {
  real: { icon: CheckCircle, label: "Authentic Document", class: "status-real" },
  suspicious: { icon: AlertTriangle, label: "Suspicious Document", class: "status-suspicious" },
  fake: { icon: XCircle, label: "Likely Fraudulent", class: "status-fake" },
};

const typeIcons: Record<string, typeof FileText> = { pdf: FileText, image: Image, video: Video };

function getFileType(name: string): "pdf" | "image" | "video" {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)) return "image";
  if (["mp4", "avi", "mov", "mkv", "webm"].includes(ext)) return "video";
  return "pdf";
}

export default function UploadView() {
  const [file, setFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{ status: VerificationStatus; confidence: number; analysis: ReturnType<typeof getMockAnalysis> } | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setResult(null); }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setResult(null); }
  };

  const handleVerify = async () => {
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));
    const vr = getVerificationResult();
    const analysis = getMockAnalysis();
    setResult({ ...vr, analysis });
    setVerifying(false);
  };

  const fileType = file ? getFileType(file.name) : "pdf";
  const Icon = typeIcons[fileType];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Upload Document</h1>
        <p className="text-muted-foreground text-sm mt-1">Upload a document to verify its authenticity and analyze its contents.</p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="glass-card glow-border p-12 flex flex-col items-center gap-4 cursor-pointer transition-colors hover:border-primary/30"
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Upload className="w-7 h-7 text-primary" />
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground">Drop your file here or click to browse</p>
          <p className="text-sm text-muted-foreground mt-1">Supports PDF, images, and video files</p>
        </div>
        <input id="file-input" type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mkv" onChange={handleFileSelect} />
      </div>

      <AnimatePresence>
        {file && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB · {fileType.toUpperCase()}</p>
              </div>
            </div>
            <Button onClick={handleVerify} disabled={verifying} className="gap-2">
              {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {verifying ? "Verifying..." : "Verify Document"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Verification Result */}
            <div className="glass-card p-6">
              <h2 className="font-heading text-lg font-semibold mb-4">Verification Result</h2>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${statusConfig[result.status].class}`}>
                {(() => { const SI = statusConfig[result.status].icon; return <SI className="w-4 h-4" />; })()}
                {statusConfig[result.status].label}
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Confidence Score</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${result.confidence}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full rounded-full ${result.status === "real" ? "bg-status-real" : result.status === "suspicious" ? "bg-status-suspicious" : "bg-status-fake"}`}
                    />
                  </div>
                  <span className="text-sm font-semibold">{result.confidence}%</span>
                </div>
              </div>
            </div>

            {/* Analysis */}
            <div className="glass-card p-6">
              <h2 className="font-heading text-lg font-semibold mb-4">Document Analysis</h2>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <h3 className="text-sm font-semibold text-primary mb-2">Clauses Found</h3>
                  <ul className="space-y-2">
                    {result.analysis.clauses.map((c, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-status-suspicious mb-2">Risk Factors</h3>
                  <ul className="space-y-2">
                    {result.analysis.risks.map((r, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-status-suspicious mt-0.5 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-status-real mb-2">Timeline</h3>
                  <ul className="space-y-2">
                    {result.analysis.timeline.map((t, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        <span className="text-foreground font-medium">{t.date}</span> — {t.event}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
