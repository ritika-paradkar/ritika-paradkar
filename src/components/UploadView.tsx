import { useState, useCallback } from "react";
import { Upload, FileText, Image, Video, CheckCircle, AlertTriangle, XCircle, Loader2, ShieldCheck, Bot, Volume2, VolumeX, Languages } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getVerificationResult, getMockAnalysis, type VerificationStatus } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import RiskScoreGauge from "@/components/RiskScoreGauge";
import CaseTimeline from "@/components/CaseTimeline";
import AlertPanel from "@/components/AlertPanel";

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

const LEGAL_KEYWORDS = [
  "contract", "agreement", "affidavit", "deed", "notice", "legal", "court",
  "petition", "complaint", "summons", "warrant", "judgment", "order", "lease",
  "power of attorney", "will", "testament", "bond", "memorandum", "clause",
  "disclosure", "settlement", "arbitration", "indemnity", "license", "nda",
  "non-disclosure", "terms", "policy", "compliance", "evidence", "exhibit",
  "declaration", "pleading", "motion", "brief", "statute", "regulation",
  "invoice", "receipt", "statement", "report", "certificate", "document",
  "case", "filing", "doc", "scan", "signed", "notarized", "certified",
];

function isLikelyLegalDocument(file: File): { isLegal: boolean; reason: string } {
  const name = file.name.toLowerCase();
  const ext = name.split(".").pop() || "";

  // PDFs are very likely legal documents
  if (ext === "pdf") {
    return { isLegal: true, reason: "PDF document detected" };
  }

  // Check filename for legal keywords
  const hasLegalKeyword = LEGAL_KEYWORDS.some((kw) => name.includes(kw));
  if (hasLegalKeyword) {
    return { isLegal: true, reason: "Legal document keyword found in filename" };
  }

  // Videos — only legal if name suggests evidence/exhibit
  if (["mp4", "avi", "mov", "mkv", "webm"].includes(ext)) {
    const evidenceKeywords = ["evidence", "exhibit", "cctv", "footage", "recording", "testimony", "deposition", "surveillance"];
    const isEvidence = evidenceKeywords.some((kw) => name.includes(kw));
    if (isEvidence) return { isLegal: true, reason: "Video evidence detected" };
    return { isLegal: false, reason: "This video does not appear to be legal evidence. Please rename it to include a descriptor like 'evidence', 'exhibit', or 'cctv', or upload an actual legal document." };
  }

  // Images — only legal if name suggests a scanned doc or evidence
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)) {
    const scanKeywords = ["scan", "document", "evidence", "exhibit", "receipt", "invoice", "contract", "agreement", "id", "license", "certificate", "notarized", "court", "signed"];
    const isScan = scanKeywords.some((kw) => name.includes(kw));
    if (isScan) return { isLegal: true, reason: "Scanned legal document detected" };
    return { isLegal: false, reason: "This image does not appear to be a legal document. If it's a scanned document, please rename it to include a descriptor like 'scan', 'document', 'evidence', or 'contract'." };
  }

  return { isLegal: true, reason: "Document accepted for analysis" };
}

export default function UploadView() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{
    status: VerificationStatus;
    confidence: number;
    riskScore: number;
    analysis: ReturnType<typeof getMockAnalysis>;
  } | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setResult(null); setRejectionReason(null); }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setResult(null); setRejectionReason(null); }
  };

  const handleVerify = async () => {
    if (!file) return;
    const check = isLikelyLegalDocument(file);
    if (!check.isLegal) {
      setRejectionReason(check.reason);
      setResult(null);
      return;
    }
    setRejectionReason(null);
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));
    const vr = getVerificationResult();
    const analysis = getMockAnalysis();
    setResult({ ...vr, analysis });
    setVerifying(false);
  };

  const speakResult = () => {
    if (!result || !file) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }

    const textEn = `Document ${file.name} has been analyzed. Verification result: ${result.status}. Risk score: ${result.riskScore} out of 100. ${result.analysis.risks.join(". ")}. Recommendation: ${result.analysis.recommendation.action}`;
    const textHi = `दस्तावेज़ ${file.name} का विश्लेषण किया गया है। सत्यापन परिणाम: ${result.status === "real" ? "असली" : result.status === "suspicious" ? "संदिग्ध" : "नकली"}। जोखिम स्कोर: ${result.riskScore}। सिफारिश: ${result.analysis.recommendation.action}`;

    const u = new SpeechSynthesisUtterance(lang === "en" ? textEn : textHi);
    u.lang = lang === "en" ? "en-US" : "hi-IN";
    u.rate = 0.9;
    u.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  };

  const fileType = file ? getFileType(file.name) : "pdf";
  const Icon = typeIcons[fileType];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Upload & Verify Document</h1>
        <p className="text-muted-foreground text-sm mt-1">Drag & drop a document to verify authenticity, detect deepfakes, and analyze legal content.</p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`glass-card glow-border p-12 flex flex-col items-center gap-4 cursor-pointer transition-all ${dragOver ? "border-primary/60 bg-primary/5 scale-[1.01]" : "hover:border-primary/30"}`}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <motion.div
          animate={dragOver ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"
        >
          <Upload className="w-7 h-7 text-primary" />
        </motion.div>
        <div className="text-center">
          <p className="font-medium text-foreground">{dragOver ? "Drop it here!" : "Drag & drop your file here"}</p>
          <p className="text-sm text-muted-foreground mt-1">Supports PDF, images, and video files · Max 50MB</p>
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
              {verifying ? "Analyzing..." : "Verify & Analyze"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Verification + Risk Score */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-lg font-semibold">Verification Result</h2>
                <div className="flex items-center gap-2">
                  <button onClick={speakResult} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${speaking ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"}`}>
                    {speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    {speaking ? "Stop" : "Explain"}
                  </button>
                  <button onClick={() => setLang(lang === "en" ? "hi" : "en")} className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium bg-secondary/60 hover:bg-secondary text-muted-foreground">
                    <Languages className="w-3 h-3" />{lang === "en" ? "EN" : "हिं"}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <RiskScoreGauge score={result.riskScore} size="lg" />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${statusConfig[result.status].class}`}>
                      {(() => { const SI = statusConfig[result.status].icon; return <SI className="w-4 h-4" />; })()}
                      {statusConfig[result.status].label}
                    </span>
                    {result.status === "real" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold bg-status-real/15 text-status-real border border-status-real/30">
                        <ShieldCheck className="w-3 h-3" />VERIFIED EVIDENCE
                      </span>
                    )}
                  </div>
                  <div>
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
              </div>
            </div>

            {/* Alerts */}
            {result.analysis.alerts.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-status-suspicious" />Auto Alerts
                </h2>
                <AlertPanel alerts={result.analysis.alerts} />
              </div>
            )}

            {/* AI Recommendation */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-4 h-4 text-primary" />
                <h2 className="font-heading text-lg font-semibold">AI Recommendation</h2>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-foreground/90 mb-1">{result.analysis.recommendation.reasoning}</p>
                <p className="text-sm font-medium text-primary">{result.analysis.recommendation.action}</p>
                <p className="text-xs text-muted-foreground mt-1.5">Suggested: {result.analysis.recommendation.lawyerType} · Priority: <span className="capitalize font-medium">{result.analysis.recommendation.priority}</span></p>
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
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />{c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-status-suspicious mb-2">Risk Factors</h3>
                  <ul className="space-y-2">
                    {result.analysis.risks.map((r, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-status-suspicious mt-0.5 shrink-0" />{r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-primary mb-2">Case Progress</h3>
                  <CaseTimeline events={result.analysis.timeline} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
