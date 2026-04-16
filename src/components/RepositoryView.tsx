import { mockDocuments } from "@/lib/mockData";
import { CheckCircle, XCircle, AlertTriangle, FileText, Image, Video, Database, ShieldCheck, ShieldX } from "lucide-react";
import { motion } from "framer-motion";

const typeIcons = { pdf: FileText, image: Image, video: Video };

export default function RepositoryView() {
  const verified = mockDocuments.filter((d) => d.status === "real");
  const rejected = mockDocuments.filter((d) => d.status === "fake");
  const pending = mockDocuments.filter((d) => d.status === "suspicious");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Document Repository</h1>
        <p className="text-muted-foreground text-sm mt-1">Verified documents are securely stored. Fake documents are rejected and flagged.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-status-real/10 text-status-real">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-heading font-bold">{verified.length}</p>
            <p className="text-xs text-muted-foreground">Verified & Stored</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-status-suspicious/10 text-status-suspicious">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-heading font-bold">{pending.length}</p>
            <p className="text-xs text-muted-foreground">Under Review</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-status-fake/10 text-status-fake">
            <ShieldX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-heading font-bold">{rejected.length}</p>
            <p className="text-xs text-muted-foreground">Rejected & Flagged</p>
          </div>
        </div>
      </div>

      {/* Verified Documents */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-status-real" />
          <h2 className="font-heading text-base font-semibold">Secure Repository</h2>
        </div>
        <div className="space-y-2">
          {verified.map((doc, i) => {
            const Icon = typeIcons[doc.type];
            return (
              <motion.div key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-border/50">
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.caseType} · {doc.size} · {doc.uploadDate}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold status-real">
                  <CheckCircle className="w-3 h-3" />Verified
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Rejected */}
      {rejected.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-4 h-4 text-status-fake" />
            <h2 className="font-heading text-base font-semibold">Rejected Documents</h2>
          </div>
          <div className="space-y-2">
            {rejected.map((doc) => {
              const Icon = typeIcons[doc.type];
              return (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-status-fake/5 border border-status-fake/20">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.caseType} · Confidence: {doc.confidence}%</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold status-fake">
                    <XCircle className="w-3 h-3" />Rejected
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
