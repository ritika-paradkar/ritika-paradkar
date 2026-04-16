import { useState, useEffect } from "react";
import { Map, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { mockDocuments } from "@/lib/mockData";

interface HeatDoc { id: string; name: string; riskScore: number; status: string; caseType: string; }

export default function HeatmapView() {
  const [docs, setDocs] = useState<HeatDoc[]>([]);

  useEffect(() => {
    supabase.from("documents").select("id, file_name, risk_score, status, case_type").order("created_at", { ascending: false })
      .then(({ data }) => {
        const dbDocs: HeatDoc[] = (data || []).map(d => ({ id: d.id, name: d.file_name, riskScore: d.risk_score, status: d.status, caseType: d.case_type || "Unknown" }));
        const mock: HeatDoc[] = mockDocuments.map(d => ({ id: d.id, name: d.name, riskScore: d.riskScore, status: d.status, caseType: d.caseType }));
        setDocs([...dbDocs, ...mock]);
      });
  }, []);

  const getColor = (score: number) => {
    if (score >= 70) return "bg-status-fake/30 border-status-fake/50 hover:bg-status-fake/40";
    if (score >= 40) return "bg-status-suspicious/20 border-status-suspicious/40 hover:bg-status-suspicious/30";
    return "bg-status-real/15 border-status-real/30 hover:bg-status-real/25";
  };

  const getGlow = (score: number) => {
    if (score >= 70) return "shadow-[0_0_15px_-3px_hsl(var(--status-fake)/0.4)]";
    if (score >= 40) return "shadow-[0_0_12px_-3px_hsl(var(--status-suspicious)/0.3)]";
    return "";
  };

  // Group by case type
  const grouped = docs.reduce((acc, d) => { (acc[d.caseType] = acc[d.caseType] || []).push(d); return acc; }, {} as Record<string, HeatDoc[]>);

  const high = docs.filter(d => d.riskScore >= 70).length;
  const med = docs.filter(d => d.riskScore >= 40 && d.riskScore < 70).length;
  const low = docs.filter(d => d.riskScore < 40).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2"><Map className="w-6 h-6 text-primary" />Case Heatmap Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Visual risk distribution across all cases — red = high risk, yellow = medium, green = low.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-status-fake" />
          <div><p className="text-lg font-bold">{high}</p><p className="text-xs text-muted-foreground">High Risk</p></div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-status-suspicious" />
          <div><p className="text-lg font-bold">{med}</p><p className="text-xs text-muted-foreground">Medium Risk</p></div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-status-real" />
          <div><p className="text-lg font-bold">{low}</p><p className="text-xs text-muted-foreground">Low Risk</p></div>
        </div>
      </div>

      {Object.entries(grouped).map(([type, typeDocs]) => (
        <div key={type} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-primary" />{type}
            <span className="text-xs text-muted-foreground ml-auto">{typeDocs.length} cases</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {typeDocs.sort((a, b) => b.riskScore - a.riskScore).map((doc, i) => (
              <motion.div key={doc.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                className={`relative p-3 rounded-lg border cursor-default transition-all ${getColor(doc.riskScore)} ${getGlow(doc.riskScore)}`}
                style={{ minWidth: Math.max(80, doc.riskScore * 1.5) }}
                title={`${doc.name} — Risk: ${doc.riskScore}`}>
                <p className="text-[10px] font-medium truncate">{doc.name.slice(0, 18)}</p>
                <p className={`text-lg font-bold font-heading ${doc.riskScore >= 70 ? "text-status-fake" : doc.riskScore >= 40 ? "text-status-suspicious" : "text-status-real"}`}>
                  {doc.riskScore}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
