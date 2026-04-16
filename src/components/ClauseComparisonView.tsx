import { useState, useEffect } from "react";
import { GitCompare, FileText, ArrowRight, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface Doc { id: string; file_name: string; clauses: string[]; risk_score: number; status: string; case_type: string; }

export default function ClauseComparisonView() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [docA, setDocA] = useState<string>("");
  const [docB, setDocB] = useState<string>("");

  useEffect(() => {
    supabase.from("documents").select("id, file_name, clauses, risk_score, status, case_type").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setDocs(data.map(d => ({ ...d, clauses: Array.isArray(d.clauses) ? d.clauses as string[] : [] }))); });
  }, []);

  const a = docs.find(d => d.id === docA);
  const b = docs.find(d => d.id === docB);

  const getComparison = () => {
    if (!a || !b) return { onlyA: [], onlyB: [], common: [] };
    const setA = new Set(a.clauses.map(c => c.toLowerCase()));
    const setB = new Set(b.clauses.map(c => c.toLowerCase()));
    const common = a.clauses.filter(c => setB.has(c.toLowerCase()));
    const onlyA = a.clauses.filter(c => !setB.has(c.toLowerCase()));
    const onlyB = b.clauses.filter(c => !setA.has(c.toLowerCase()));
    return { common, onlyA, onlyB };
  };

  const { common, onlyA, onlyB } = getComparison();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2"><GitCompare className="w-6 h-6 text-primary" />Clause Comparison Tool</h1>
        <p className="text-muted-foreground text-sm mt-1">Compare clauses between two documents to identify differences and overlaps.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Document A</p>
          <select value={docA} onChange={(e) => setDocA(e.target.value)} className="w-full p-2 rounded-lg bg-secondary/40 border border-border/50 text-sm text-foreground">
            <option value="">Select document...</option>
            {docs.map(d => <option key={d.id} value={d.id}>{d.file_name}</option>)}
          </select>
          {a && (
            <div className="mt-3 p-3 rounded-lg bg-secondary/30">
              <p className="text-xs text-muted-foreground">{a.case_type} · Risk: {a.risk_score} · {a.clauses.length} clauses</p>
            </div>
          )}
        </div>
        <div className="glass-card p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Document B</p>
          <select value={docB} onChange={(e) => setDocB(e.target.value)} className="w-full p-2 rounded-lg bg-secondary/40 border border-border/50 text-sm text-foreground">
            <option value="">Select document...</option>
            {docs.filter(d => d.id !== docA).map(d => <option key={d.id} value={d.id}>{d.file_name}</option>)}
          </select>
          {b && (
            <div className="mt-3 p-3 rounded-lg bg-secondary/30">
              <p className="text-xs text-muted-foreground">{b.case_type} · Risk: {b.risk_score} · {b.clauses.length} clauses</p>
            </div>
          )}
        </div>
      </div>

      {a && b && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-status-suspicious mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />Only in {a.file_name.slice(0, 20)}
              </h3>
              {onlyA.length === 0 ? <p className="text-xs text-muted-foreground">No unique clauses</p> : (
                <ul className="space-y-2">{onlyA.map((c, i) => (
                  <li key={i} className="text-xs p-2 rounded bg-status-suspicious/10 border border-status-suspicious/20 text-foreground/80">{c}</li>
                ))}</ul>
              )}
            </div>
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-status-real mb-3 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />Common Clauses
              </h3>
              {common.length === 0 ? <p className="text-xs text-muted-foreground">No common clauses</p> : (
                <ul className="space-y-2">{common.map((c, i) => (
                  <li key={i} className="text-xs p-2 rounded bg-status-real/10 border border-status-real/20 text-foreground/80">{c}</li>
                ))}</ul>
              )}
            </div>
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />Only in {b.file_name.slice(0, 20)}
              </h3>
              {onlyB.length === 0 ? <p className="text-xs text-muted-foreground">No unique clauses</p> : (
                <ul className="space-y-2">{onlyB.map((c, i) => (
                  <li key={i} className="text-xs p-2 rounded bg-primary/10 border border-primary/20 text-foreground/80">{c}</li>
                ))}</ul>
              )}
            </div>
          </div>

          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-3">Risk Comparison</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">{a.file_name.slice(0, 25)}</p>
                <div className="h-3 rounded-full bg-secondary overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${a.risk_score}%` }}
                    className={`h-full rounded-full ${a.risk_score >= 70 ? "bg-status-fake" : a.risk_score >= 40 ? "bg-status-suspicious" : "bg-status-real"}`} />
                </div>
                <p className="text-xs font-semibold mt-1">{a.risk_score}/100</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">{b.file_name.slice(0, 25)}</p>
                <div className="h-3 rounded-full bg-secondary overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${b.risk_score}%` }}
                    className={`h-full rounded-full ${b.risk_score >= 70 ? "bg-status-fake" : b.risk_score >= 40 ? "bg-status-suspicious" : "bg-status-real"}`} />
                </div>
                <p className="text-xs font-semibold mt-1">{b.risk_score}/100</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {docs.length === 0 && (
        <div className="glass-card p-12 flex flex-col items-center gap-3 text-center">
          <GitCompare className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No analyzed documents yet. Upload and analyze documents first.</p>
        </div>
      )}
    </div>
  );
}
