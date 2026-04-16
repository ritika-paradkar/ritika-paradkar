import { mockLawyers, mockDocuments, type Lawyer } from "@/lib/mockData";
import { Users, Star, Briefcase, Mail, Calendar, Sparkles, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const availColors: Record<Lawyer["availability"], string> = {
  available: "bg-status-real text-status-real",
  busy: "bg-status-suspicious text-status-suspicious",
  unavailable: "bg-status-fake text-status-fake",
};

const availBg: Record<Lawyer["availability"], string> = {
  available: "status-real",
  busy: "status-suspicious",
  unavailable: "status-fake",
};

function getRecommendedLawyer(caseType: string): Lawyer | null {
  const specMap: Record<string, string> = {
    "Employment Law": "Employment Law",
    "Real Estate": "Real Estate",
    "Criminal Defense": "Criminal Defense",
    "Contract Dispute": "Contract Dispute",
    "Intellectual Property": "Intellectual Property",
    "Immigration": "Immigration",
    "Fraud": "Criminal Defense",
  };

  const spec = specMap[caseType] || caseType;
  const available = mockLawyers
    .filter(l => l.availability !== "unavailable" && l.specialization === spec)
    .sort((a, b) => b.rating - a.rating);
  
  if (available.length > 0) return available[0];
  
  // Fallback: any available lawyer sorted by rating
  return mockLawyers
    .filter(l => l.availability !== "unavailable")
    .sort((a, b) => b.rating - a.rating)[0] || null;
}

export default function LawyersView() {
  const [selected, setSelected] = useState<Lawyer | null>(null);
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [showRecommendation, setShowRecommendation] = useState(false);

  useEffect(() => {
    supabase.from("documents").select("id, file_name, case_type, risk_score, priority")
      .order("created_at", { ascending: false }).limit(5)
      .then(({ data }) => { if (data) setRecentDocs(data); });
  }, []);

  const assignedDocs = selected
    ? mockDocuments.filter((d) => d.assignedLawyer === selected.id)
    : [];

  // Get recommendations for recent docs
  const recommendations = recentDocs.map(d => ({
    doc: d,
    lawyer: getRecommendedLawyer(d.case_type || "General"),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Lawyer Directory & Recommendations</h1>
        <p className="text-muted-foreground text-sm mt-1">AI recommends the best lawyer for each case based on specialization, experience, and availability.</p>
      </div>

      {/* AI Recommendation Engine */}
      {recommendations.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />AI Lawyer Recommendations</h3>
            <button onClick={() => setShowRecommendation(!showRecommendation)} className="text-xs text-primary hover:underline">
              {showRecommendation ? "Hide" : "Show"} recommendations
            </button>
          </div>
          {showRecommendation && (
            <div className="space-y-2">
              {recommendations.map((r, i) => r.lawyer && (
                <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{r.lawyer.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{r.doc.file_name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.doc.case_type} · Risk: {r.doc.risk_score}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-primary flex items-center gap-1"><CheckCircle className="w-3 h-3" />{r.lawyer.name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.lawyer.specialization} · ⭐ {r.lawyer.rating}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6" style={{ gridTemplateColumns: selected ? "1fr 1fr" : "1fr" }}>
        <div className="grid gap-4 sm:grid-cols-2">
          {mockLawyers.map((lawyer, i) => (
            <motion.div
              key={lawyer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(lawyer)}
              className={`glass-card p-5 cursor-pointer transition-all hover:border-primary/30 ${selected?.id === lawyer.id ? "border-primary/50 glow-border" : ""}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {lawyer.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{lawyer.name}</p>
                  <p className="text-xs text-muted-foreground">{lawyer.specialization}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold capitalize ${availBg[lawyer.availability]}`}>
                  {lawyer.availability}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-status-suspicious" />{lawyer.rating}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{lawyer.activeCases}/{lawyer.maxCases} cases</span>
                <span>{lawyer.experience}y exp</span>
              </div>
            </motion.div>
          ))}
        </div>

        {selected && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 space-y-5 h-fit">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                  {selected.avatar}
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold">{selected.name}</h2>
                  <p className="text-sm text-muted-foreground">{selected.specialization}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <p className="text-lg font-bold">{selected.experience}</p>
                <p className="text-xs text-muted-foreground">Years Exp</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <p className="text-lg font-bold">{selected.activeCases}/{selected.maxCases}</p>
                <p className="text-xs text-muted-foreground">Cases</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <p className="text-lg font-bold flex items-center justify-center gap-1"><Star className="w-3.5 h-3.5 text-status-suspicious" />{selected.rating}</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />{selected.email}
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />Assigned Cases</h3>
              {assignedDocs.length === 0 ? (
                <p className="text-xs text-muted-foreground">No cases currently assigned.</p>
              ) : (
                <ul className="space-y-2">
                  {assignedDocs.map((doc) => (
                    <li key={doc.id} className="p-3 rounded-lg bg-secondary/40 border border-border/50">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${doc.priority === "high" ? "priority-high" : doc.priority === "medium" ? "priority-medium" : "priority-low"}`}>
                          {doc.priority}
                        </span>
                        <span className="text-xs text-muted-foreground">{doc.caseType}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
