import { useState, useCallback } from "react";
import { Upload, Shield, AlertTriangle, CheckCircle, XCircle, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import RiskScoreGauge from "@/components/RiskScoreGauge";

export default function PublicModeView() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setResult(null); }
  }, []);

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-document", {
        body: { fileName: file.name, fileType: file.name.split(".").pop() || "pdf", fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB` },
      });
      if (error) throw error;
      setResult(data.document);
      toast.success("Analysis complete!");
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally { setLoading(false); }
  };

  const statusLabel = result?.status === "real" ? "✅ This contract looks legitimate" : result?.status === "suspicious" ? "⚠️ Some concerns found" : "🚨 High fraud risk detected";
  const statusColor = result?.status === "real" ? "text-status-real" : result?.status === "suspicious" ? "text-status-suspicious" : "text-status-fake";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-heading text-3xl font-bold">Contract Risk Checker</h1>
        <p className="text-muted-foreground mt-2">Upload any contract or legal document to get a simple, easy-to-understand risk assessment. No legal expertise needed.</p>
      </div>

      <div onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
        onClick={() => document.getElementById("public-file")?.click()}
        className={`glass-card glow-border p-12 flex flex-col items-center gap-4 cursor-pointer transition-all ${dragOver ? "border-primary/60 bg-primary/5" : "hover:border-primary/30"}`}>
        <Upload className="w-10 h-10 text-primary" />
        <p className="font-medium">{file ? file.name : "Drop your contract here or click to browse"}</p>
        <p className="text-xs text-muted-foreground">Supports PDF, DOC, images</p>
        <input id="public-file" type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setResult(null); } }} />
      </div>

      {file && !result && (
        <Button onClick={analyze} disabled={loading} className="w-full gap-2 h-12 text-base">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
          {loading ? "Analyzing your document..." : "Check My Contract"}
        </Button>
      )}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass-card p-8 text-center">
              <p className={`text-xl font-heading font-bold ${statusColor}`}>{statusLabel}</p>
              <div className="flex justify-center mt-4">
                <RiskScoreGauge score={result.risk_score} size="lg" />
              </div>
              <p className="text-sm text-muted-foreground mt-3">Confidence: {result.confidence}% · Type: {result.case_type}</p>
            </div>

            {Array.isArray(result.risks) && result.risks.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="font-heading text-lg font-semibold mb-3">⚠️ Things to Watch Out For</h3>
                <ul className="space-y-2">
                  {(result.risks as string[]).map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-status-suspicious mt-0.5 shrink-0" />
                      <span className="text-foreground/80">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.recommendation && (
              <div className="glass-card p-6 bg-primary/5 border-primary/20">
                <h3 className="font-heading text-lg font-semibold mb-2">💡 What We Recommend</h3>
                <p className="text-sm text-foreground/80">{typeof result.recommendation === "object" ? result.recommendation.action : result.recommendation}</p>
              </div>
            )}

            <Button onClick={() => { setFile(null); setResult(null); }} variant="outline" className="w-full">
              Check Another Document
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
