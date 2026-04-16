import { useState, useEffect } from "react";
import { History, FileText, Clock, GitBranch } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

export default function VersionHistoryView() {
  const [docs, setDocs] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState("");

  useEffect(() => {
    supabase.from("documents").select("id, file_name, status, risk_score, case_type, created_at, updated_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setDocs(data); });
  }, []);

  useEffect(() => {
    if (!selectedDoc) { setVersions([]); return; }
    supabase.from("document_versions").select("*").eq("document_id", selectedDoc).order("version_number", { ascending: false })
      .then(({ data }) => { setVersions(data || []); });
  }, [selectedDoc]);

  const doc = docs.find(d => d.id === selectedDoc);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2"><History className="w-6 h-6 text-primary" />Document Version History</h1>
        <p className="text-muted-foreground text-sm mt-1">Track changes across document versions — useful for detecting tampering and maintaining audit trails.</p>
      </div>

      <div className="glass-card p-4">
        <select value={selectedDoc} onChange={(e) => setSelectedDoc(e.target.value)}
          className="w-full p-2 rounded-lg bg-secondary/40 border border-border/50 text-sm text-foreground">
          <option value="">Select document...</option>
          {docs.map(d => <option key={d.id} value={d.id}>{d.file_name}</option>)}
        </select>
      </div>

      {doc && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-semibold">{doc.file_name}</p>
              <p className="text-xs text-muted-foreground">{doc.case_type} · Risk: {doc.risk_score} · Status: {doc.status}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-secondary/40 text-center">
              <p className="text-lg font-bold">{versions.length + 1}</p>
              <p className="text-xs text-muted-foreground">Total Versions</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/40 text-center">
              <p className="text-xs font-mono">{new Date(doc.created_at).toLocaleDateString()}</p>
              <p className="text-xs text-muted-foreground">First Upload</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/40 text-center">
              <p className="text-xs font-mono">{new Date(doc.updated_at).toLocaleDateString()}</p>
              <p className="text-xs text-muted-foreground">Last Modified</p>
            </div>
          </div>

          <div className="space-y-0">
            {/* Current version */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/30">
                  <GitBranch className="w-4 h-4 text-primary" />
                </div>
                {versions.length > 0 && <div className="w-0.5 h-8 bg-border" />}
              </div>
              <div className="pb-4">
                <p className="text-sm font-medium">Current Version</p>
                <p className="text-xs text-muted-foreground">{new Date(doc.updated_at).toLocaleString()}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold mt-1 inline-block">Active</span>
              </div>
            </div>

            {/* Past versions */}
            {versions.map((v, i) => (
              <motion.div key={v.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  {i < versions.length - 1 && <div className="w-0.5 h-8 bg-border" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium">Version {v.version_number}</p>
                  <p className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleString()}</p>
                  {v.changes_summary && <p className="text-xs text-foreground/70 mt-1">{v.changes_summary}</p>}
                </div>
              </motion.div>
            ))}

            {versions.length === 0 && (
              <p className="text-xs text-muted-foreground ml-11">No previous versions recorded. Future edits will appear here.</p>
            )}
          </div>
        </div>
      )}

      {docs.length === 0 && (
        <div className="glass-card p-12 text-center">
          <History className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No documents analyzed yet.</p>
        </div>
      )}
    </div>
  );
}
