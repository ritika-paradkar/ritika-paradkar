import { useState, useEffect } from "react";
import { Wand2, TrendingUp, TrendingDown, Minus, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import RiskScoreGauge from "@/components/RiskScoreGauge";
import { toast } from "sonner";

interface SimResult {
  originalRiskScore: number;
  editedRiskScore: number;
  riskChange: number;
  analysis: { clause: string; originalRisk: string; editedRisk: string; explanation: string }[];
  overallAssessment: string;
  recommendation: string;
}

export default function RiskSimulatorView() {
  const [docs, setDocs] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [originalClauses, setOriginalClauses] = useState<string[]>([]);
  const [editedClauses, setEditedClauses] = useState<string[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<SimResult | null>(null);

  useEffect(() => {
    supabase.from("documents").select("id, file_name, clauses, case_type").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setDocs(data); });
  }, []);

  const selectDoc = (id: string) => {
    setSelectedDoc(id);
    setResult(null);
    const doc = docs.find(d => d.id === id);
    if (doc) {
      const clauses = Array.isArray(doc.clauses) ? doc.clauses as string[] : [];
      setOriginalClauses(clauses);
      setEditedClauses([...clauses]);
    }
  };

  const simulate = async () => {
    if (editedClauses.length === 0) return;
    const doc = docs.find(d => d.id === selectedDoc);
    setSimulating(true);
    try {
      const { data, error } = await supabase.functions.invoke("risk-simulator", {
        body: { originalClauses, editedClauses, caseType: doc?.case_type || "General" },
      });
      if (error) throw error;
      setResult(data);
      toast.success("Risk simulation complete!");
    } catch (e: any) {
      toast.error(e.message || "Simulation failed");
    } finally { setSimulating(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2"><Wand2 className="w-6 h-6 text-primary" />"What If" Risk Simulator</h1>
        <p className="text-muted-foreground text-sm mt-1">Edit clauses and see how risk score changes — AI predicts the impact of modifications.</p>
      </div>

      <div className="glass-card p-4">
        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Select Document</p>
        <select value={selectedDoc} onChange={(e) => selectDoc(e.target.value)} className="w-full p-2 rounded-lg bg-secondary/40 border border-border/50 text-sm text-foreground">
          <option value="">Choose a document...</option>
          {docs.map(d => <option key={d.id} value={d.id}>{d.file_name}</option>)}
        </select>
      </div>

      {selectedDoc && (
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Original Clauses</h3>
            <ul className="space-y-2">
              {originalClauses.map((c, i) => (
                <li key={i} className="text-xs p-2 rounded bg-secondary/40 border border-border/50">{c}</li>
              ))}
            </ul>
          </div>
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-3 text-primary">Edited Clauses (modify below)</h3>
            <div className="space-y-2">
              {editedClauses.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={c} onChange={(e) => { const n = [...editedClauses]; n[i] = e.target.value; setEditedClauses(n); }}
                    className="text-xs bg-secondary/40" />
                  <button onClick={() => setEditedClauses(editedClauses.filter((_, j) => j !== i))}
                    className="text-muted-foreground hover:text-status-fake"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              <button onClick={() => setEditedClauses([...editedClauses, "New clause..."])}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"><Plus className="w-3 h-3" />Add clause</button>
            </div>
            <Button onClick={simulate} disabled={simulating} className="w-full mt-4 gap-2">
              {simulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {simulating ? "Simulating..." : "Simulate Risk Change"}
            </Button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold mb-4">Risk Impact</h3>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <RiskScoreGauge score={result.originalRiskScore} size="lg" />
                  <p className="text-xs text-muted-foreground mt-2">Original</p>
                </div>
                <div className="text-center">
                  {result.riskChange > 0 ? <TrendingUp className="w-8 h-8 text-status-fake mx-auto" /> :
                    result.riskChange < 0 ? <TrendingDown className="w-8 h-8 text-status-real mx-auto" /> :
                      <Minus className="w-8 h-8 text-muted-foreground mx-auto" />}
                  <p className={`text-lg font-bold mt-1 ${result.riskChange > 0 ? "text-status-fake" : result.riskChange < 0 ? "text-status-real" : "text-muted-foreground"}`}>
                    {result.riskChange > 0 ? "+" : ""}{result.riskChange}
                  </p>
                </div>
                <div className="text-center">
                  <RiskScoreGauge score={result.editedRiskScore} size="lg" />
                  <p className="text-xs text-muted-foreground mt-2">After Edit</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold mb-3">Clause-by-Clause Analysis</h3>
              <div className="space-y-2">
                {result.analysis.map((a, i) => (
                  <div key={i} className="p-3 rounded-lg bg-secondary/40 border border-border/50">
                    <p className="text-xs font-semibold">{a.clause}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${a.originalRisk === "high" ? "priority-high" : a.originalRisk === "medium" ? "priority-medium" : "priority-low"}`}>{a.originalRisk}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${a.editedRisk === "high" ? "priority-high" : a.editedRisk === "medium" ? "priority-medium" : "priority-low"}`}>{a.editedRisk}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{a.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-4">
              <p className="text-sm text-foreground/90">{result.overallAssessment}</p>
              <p className="text-sm font-medium text-primary mt-2">{result.recommendation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
