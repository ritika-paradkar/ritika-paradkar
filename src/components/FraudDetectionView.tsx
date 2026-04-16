import { useState, useEffect } from "react";
import { ShieldAlert, AlertTriangle, TrendingUp, Eye, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { mockDocuments } from "@/lib/mockData";

export default function FraudDetectionView() {
  const [docs, setDocs] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("documents").select("*").order("created_at", { ascending: false })
      .then(({ data }) => {
        const all = [
          ...(data || []).map(d => ({ id: d.id, name: d.file_name, status: d.status, riskScore: d.risk_score, caseType: d.case_type, confidence: d.confidence, risks: d.risks, date: d.created_at })),
          ...mockDocuments.map(d => ({ id: d.id, name: d.name, status: d.status, riskScore: d.riskScore, caseType: d.caseType, confidence: d.confidence, risks: d.risks, date: d.uploadDate })),
        ];
        setDocs(all);
      });
  }, []);

  const fakeOrSuspicious = docs.filter(d => d.status === "fake" || d.status === "suspicious");
  const fakeCount = docs.filter(d => d.status === "fake").length;
  const suspiciousCount = docs.filter(d => d.status === "suspicious").length;
  const avgRiskFlagged = fakeOrSuspicious.length ? Math.round(fakeOrSuspicious.reduce((s: number, d: any) => s + (d.riskScore as number), 0) / fakeOrSuspicious.length) : 0;

  // Pattern detection: group by case type
  const typePatterns = fakeOrSuspicious.reduce((acc, d) => {
    const ct = d.caseType || "Unknown";
    acc[ct] = (acc[ct] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Common risk patterns
  const allRisks = fakeOrSuspicious.flatMap(d => Array.isArray(d.risks) ? d.risks : []);
  const riskFreq = allRisks.reduce((acc, r) => { const k = typeof r === "string" ? r : ""; if (k) acc[k] = (acc[k] || 0) + 1; return acc; }, {} as Record<string, number>);
  const topRisks = Object.entries(riskFreq).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2"><ShieldAlert className="w-6 h-6 text-status-fake" />AI Fraud Pattern Detection</h1>
        <p className="text-muted-foreground text-sm mt-1">Detect patterns in suspicious and fraudulent documents — repeated behaviors and common indicators.</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-status-fake">{fakeCount}</p>
          <p className="text-xs text-muted-foreground">Fake Detected</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-status-suspicious">{suspiciousCount}</p>
          <p className="text-xs text-muted-foreground">Suspicious</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold">{avgRiskFlagged}</p>
          <p className="text-xs text-muted-foreground">Avg Risk Score</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{Object.keys(typePatterns).length}</p>
          <p className="text-xs text-muted-foreground">Affected Categories</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 text-status-fake" />Fraud by Category</h3>
          <div className="space-y-2">
            {Object.entries(typePatterns).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <div key={type} className="flex items-center gap-3">
                <p className="text-xs flex-1">{type}</p>
                <div className="w-32 h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(count / Math.max(...Object.values(typePatterns))) * 100}%` }}
                    className="h-full rounded-full bg-status-fake" />
                </div>
                <span className="text-xs font-bold w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Eye className="w-3.5 h-3.5 text-status-suspicious" />Common Risk Patterns</h3>
          <div className="space-y-2">
            {topRisks.map(([risk, count]) => (
              <div key={risk} className="p-2 rounded-lg bg-secondary/40 border border-border/50 flex items-start gap-2">
                <AlertTriangle className="w-3 h-3 text-status-suspicious mt-0.5 shrink-0" />
                <p className="text-xs text-foreground/80 flex-1">{risk}</p>
                <span className="text-[10px] font-bold text-muted-foreground">{count}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><FileText className="w-3.5 h-3.5" />Flagged Documents</h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {fakeOrSuspicious.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              className={`p-3 rounded-lg border ${d.status === "fake" ? "bg-status-fake/5 border-status-fake/20" : "bg-status-suspicious/5 border-status-suspicious/20"}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate max-w-[50%]">{d.name}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${d.status === "fake" ? "priority-high" : "priority-medium"}`}>{d.status}</span>
                  <span className="text-xs text-muted-foreground">Risk: {d.riskScore}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{d.caseType} · Confidence: {d.confidence}%</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
