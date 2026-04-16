import { mockDocuments } from "@/lib/mockData";
import { CheckCircle, AlertTriangle, XCircle, FolderOpen, Scale, Database } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const statusIcons = { real: CheckCircle, suspicious: AlertTriangle, fake: XCircle };

export default function SimilarCasesView() {
  const [dbCases, setDbCases] = useState<any[]>([]);
  const [dbDocs, setDbDocs] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [casesRes, docsRes] = await Promise.all([
        supabase.from("cases").select("*"),
        supabase.from("documents").select("*").order("created_at", { ascending: false }),
      ]);
      if (casesRes.data) setDbCases(casesRes.data);
      if (docsRes.data) setDbDocs(docsRes.data);
    };
    fetch();
  }, []);

  // Group mock documents by case type
  const grouped = mockDocuments.reduce((acc, doc) => {
    (acc[doc.caseType] = acc[doc.caseType] || []).push(doc);
    return acc;
  }, {} as Record<string, typeof mockDocuments>);

  // Group DB documents by case type
  const dbGrouped = dbDocs.reduce((acc, doc) => {
    const ct = doc.case_type || "Unknown";
    (acc[ct] = acc[ct] || []).push(doc);
    return acc;
  }, {} as Record<string, any[]>);

  // Merge all case types
  const allTypes = new Set([...Object.keys(grouped), ...Object.keys(dbGrouped)]);

  // Group DB cases by type for the precedents section
  const casesByType = dbCases.reduce((acc, c) => {
    (acc[c.case_type] = acc[c.case_type] || []).push(c);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Similar Cases & Precedents</h1>
        <p className="text-muted-foreground text-sm mt-1">Cases grouped by type with AI-matched legal precedents from the database.</p>
      </div>

      <div className="space-y-6">
        {Array.from(allTypes).map((type, gi) => {
          const mockDocs = grouped[type] || [];
          const dbDocsForType = dbGrouped[type] || [];
          const casesForType = casesByType[type] || [];

          return (
            <motion.div key={type} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.1 }} className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <FolderOpen className="w-4 h-4 text-primary" />
                <h2 className="font-heading text-base font-semibold">{type}</h2>
                <span className="ml-auto text-xs text-muted-foreground">{mockDocs.length + dbDocsForType.length} document{mockDocs.length + dbDocsForType.length !== 1 ? "s" : ""}</span>
              </div>

              {/* DB Cases for this type */}
              {casesForType.length > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-[11px] font-semibold text-primary mb-2 flex items-center gap-1">
                    <Database className="w-3 h-3" />Database Precedents ({casesForType.length})
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {casesForType.map((c: any) => (
                      <div key={c.id} className="p-2 rounded bg-secondary/40 border border-border/50">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-medium truncate">{c.summary.slice(0, 60)}...</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${c.outcome === "Guilty" ? "priority-high" : c.outcome === "Not Guilty" || c.outcome === "Dismissed" ? "priority-low" : "priority-medium"}`}>
                            {c.outcome}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {/* AI-analyzed documents */}
                {dbDocsForType.map((doc: any) => (
                  <div key={doc.id} className="p-4 rounded-lg bg-primary/5 border border-primary/30 space-y-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate flex-1">{doc.file_name}</p>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/15 text-primary border border-primary/30">
                        <Database className="w-2.5 h-2.5" />AI
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${doc.status === "real" ? "status-real" : doc.status === "suspicious" ? "status-suspicious" : "status-fake"}`}>
                        {(() => { const SI = statusIcons[doc.status as keyof typeof statusIcons]; return SI ? <SI className="w-3 h-3" /> : null; })()}{doc.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${doc.priority === "high" ? "priority-high" : doc.priority === "medium" ? "priority-medium" : "priority-low"}`}>
                        {doc.priority}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">Risk: {doc.risk_score}</span>
                    </div>
                  </div>
                ))}

                {/* Mock documents */}
                {mockDocs.map((doc) => {
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
          );
        })}
      </div>
    </div>
  );
}
