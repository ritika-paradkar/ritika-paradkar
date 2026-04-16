import { mockDocuments } from "@/lib/mockData";
import { CheckCircle, AlertTriangle, XCircle, FolderOpen, Scale } from "lucide-react";
import { motion } from "framer-motion";

const statusIcons = { real: CheckCircle, suspicious: AlertTriangle, fake: XCircle };

export default function SimilarCasesView() {
  const grouped = mockDocuments.reduce((acc, doc) => {
    (acc[doc.caseType] = acc[doc.caseType] || []).push(doc);
    return acc;
  }, {} as Record<string, typeof mockDocuments>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Similar Cases & Precedents</h1>
        <p className="text-muted-foreground text-sm mt-1">Cases grouped by type with AI-matched legal precedents for reference.</p>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([type, docs], gi) => (
          <motion.div key={type} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.1 }} className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen className="w-4 h-4 text-primary" />
              <h2 className="font-heading text-base font-semibold">{type}</h2>
              <span className="ml-auto text-xs text-muted-foreground">{docs.length} document{docs.length > 1 ? "s" : ""}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {docs.map((doc) => {
                const SIcon = statusIcons[doc.status];
                return (
                  <div key={doc.id} className="p-4 rounded-lg bg-secondary/40 border border-border/50 space-y-3">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${doc.status === "real" ? "status-real" : doc.status === "suspicious" ? "status-suspicious" : "status-fake"}`}>
                        <SIcon className="w-3 h-3" />{doc.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${doc.priority === "high" ? "priority-high" : doc.priority === "medium" ? "priority-medium" : "priority-low"}`}>
                        {doc.priority}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">Risk: {doc.riskScore}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{doc.uploadDate} · {doc.size}</p>

                    {/* Precedents */}
                    {doc.precedents.length > 0 && (
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-[10px] font-semibold text-primary mb-1.5 flex items-center gap-1">
                          <Scale className="w-3 h-3" />Matched Precedents
                        </p>
                        {doc.precedents.slice(0, 2).map((p, i) => (
                          <div key={i} className="mb-1.5">
                            <div className="flex items-center justify-between">
                              <p className="text-[11px] font-medium truncate max-w-[70%]">{p.title} ({p.year})</p>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${p.outcome === "Guilty" ? "priority-high" : p.outcome === "Not Guilty" ? "priority-low" : "priority-medium"}`}>
                                {p.outcome}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground line-clamp-2">{p.summary}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
