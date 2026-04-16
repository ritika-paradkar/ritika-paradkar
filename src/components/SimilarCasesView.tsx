import { mockDocuments } from "@/lib/mockData";
import { CheckCircle, AlertTriangle, XCircle, FolderOpen } from "lucide-react";
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
        <h1 className="font-heading text-2xl font-bold">Similar Cases</h1>
        <p className="text-muted-foreground text-sm mt-1">Documents grouped by case type for easy comparison.</p>
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
                  <div key={doc.id} className="p-4 rounded-lg bg-secondary/40 border border-border/50 space-y-2">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${doc.status === "real" ? "status-real" : doc.status === "suspicious" ? "status-suspicious" : "status-fake"}`}>
                        <SIcon className="w-3 h-3" />{doc.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${doc.priority === "high" ? "priority-high" : doc.priority === "medium" ? "priority-medium" : "priority-low"}`}>
                        {doc.priority}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{doc.uploadDate} · {doc.size}</p>
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
