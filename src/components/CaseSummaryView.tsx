import { useState, useEffect } from "react";
import { FileBarChart, Loader2, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function CaseSummaryView() {
  const [docs, setDocs] = useState<any[]>([]);
  const [generating, setGenerating] = useState("");
  const [summaryData, setSummaryData] = useState<Record<string, any>>({});

  const fetchDocs = async () => {
    const { data } = await supabase.from("documents").select("id, file_name, case_type, status, risk_score, confidence, summary, tags")
      .order("created_at", { ascending: false });
    if (data) setDocs(data);
  };

  useEffect(() => { fetchDocs(); }, []);

  const generate = async (docId: string) => {
    setGenerating(docId);
    try {
      const { data, error } = await supabase.functions.invoke("generate-summary", { body: { documentId: docId } });
      if (error) throw error;
      setSummaryData(prev => ({ ...prev, [docId]: data }));
      toast.success("Case summary generated!");
      fetchDocs();
    } catch (e: any) {
      toast.error(e.message || "Failed to generate summary");
    } finally { setGenerating(""); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2"><FileBarChart className="w-6 h-6 text-primary" />Auto Case Summary Generator</h1>
        <p className="text-muted-foreground text-sm mt-1">AI generates professional case summaries — ready for court submissions and legal reviews.</p>
      </div>

      {docs.length === 0 && (
        <div className="glass-card p-12 text-center">
          <FileBarChart className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No analyzed documents yet. Upload and analyze documents first.</p>
        </div>
      )}

      <div className="space-y-4">
        {docs.map((d, i) => {
          const sd = summaryData[d.id];
          return (
            <motion.div key={d.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-semibold">{d.file_name}</p>
                  <span className="text-xs text-muted-foreground">{d.case_type}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${d.status === "real" ? "priority-low" : d.status === "suspicious" ? "priority-medium" : "priority-high"}`}>
                    {d.status}
                  </span>
                </div>
                <Button size="sm" className="gap-1 text-xs h-7" onClick={() => generate(d.id)} disabled={generating === d.id}>
                  {generating === d.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  {d.summary ? "Regenerate" : "Generate Summary"}
                </Button>
              </div>

              {(d.summary || sd) && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
                  <p className="text-sm text-foreground/90">{sd?.summary || d.summary}</p>
                  {sd?.keyFindings && (
                    <div>
                      <p className="text-xs font-semibold text-primary mb-1">Key Findings:</p>
                      <ul className="space-y-1">
                        {sd.keyFindings.map((f: string, j: number) => (
                          <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {sd?.recommendedActions && (
                    <div>
                      <p className="text-xs font-semibold text-status-suspicious mb-1">Recommended Actions:</p>
                      <ul className="space-y-1">
                        {sd.recommendedActions.map((a: string, j: number) => (
                          <li key={j} className="text-xs text-muted-foreground">{j + 1}. {a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
