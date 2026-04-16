import { mockDocuments, type LegalDocument, type VerificationStatus, type PriorityLevel } from "@/lib/mockData";
import { FileText, Image, Video, CheckCircle, AlertTriangle, XCircle, TrendingUp, Shield, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const statusConfig: Record<VerificationStatus, { icon: typeof CheckCircle; label: string; class: string }> = {
  real: { icon: CheckCircle, label: "Real", class: "status-real" },
  suspicious: { icon: AlertTriangle, label: "Suspicious", class: "status-suspicious" },
  fake: { icon: XCircle, label: "Fake", class: "status-fake" },
};

const priorityLabels: Record<PriorityLevel, string> = { high: "priority-high", medium: "priority-medium", low: "priority-low" };
const typeIcons = { pdf: FileText, image: Image, video: Video };

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Shield; label: string; value: string; color: string }) {
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-heading font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function DocumentRow({ doc, onClick }: { doc: LegalDocument; onClick: () => void }) {
  const Icon = typeIcons[doc.type];
  const SIcon = statusConfig[doc.status].icon;
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate max-w-[200px]">{doc.name}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{doc.caseType}</td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${statusConfig[doc.status].class}`}>
          <SIcon className="w-3 h-3" />
          {statusConfig[doc.status].label}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${priorityLabels[doc.priority]}`}>
          {doc.priority}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{doc.uploadDate}</td>
    </motion.tr>
  );
}

function DocumentDetail({ doc, onClose }: { doc: LegalDocument; onClose: () => void }) {
  const SIcon = statusConfig[doc.status].icon;
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold">{doc.name}</h2>
          <p className="text-sm text-muted-foreground">{doc.caseType} · {doc.size}</p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
      </div>

      <div className="flex gap-3">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${statusConfig[doc.status].class}`}>
          <SIcon className="w-3 h-3" />{statusConfig[doc.status].label} · {doc.confidence}%
        </span>
        <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${priorityLabels[doc.priority]}`}>
          {doc.priority} priority
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <h3 className="text-sm font-semibold text-primary mb-2">Clauses</h3>
          <ul className="space-y-1.5">
            {doc.clauses.map((c, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />{c}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-status-suspicious mb-2">Risks</h3>
          <ul className="space-y-1.5">
            {doc.risks.map((r, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <AlertTriangle className="w-3 h-3 text-status-suspicious mt-0.5 shrink-0" />{r}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-status-real mb-2">Timeline</h3>
          <ul className="space-y-1.5">
            {doc.timeline.map((t, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                <span className="text-foreground font-medium">{t.date}</span> — {t.event}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardView() {
  const [selected, setSelected] = useState<LegalDocument | null>(null);

  const realCount = mockDocuments.filter((d) => d.status === "real").length;
  const suspiciousCount = mockDocuments.filter((d) => d.status === "suspicious").length;
  const highCount = mockDocuments.filter((d) => d.priority === "high").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Lawyer Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of all cases and documents.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Shield} label="Verified Documents" value={`${realCount}/${mockDocuments.length}`} color="bg-status-real/10 text-status-real" />
        <StatCard icon={TrendingUp} label="Suspicious Flagged" value={String(suspiciousCount)} color="bg-status-suspicious/10 text-status-suspicious" />
        <StatCard icon={Clock} label="High Priority" value={String(highCount)} color="bg-priority-high/10 text-priority-high" />
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: selected ? "1fr 1fr" : "1fr" }}>
        <div className="glass-card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4 font-medium">Document</th>
                <th className="py-3 px-4 font-medium">Case Type</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Priority</th>
                <th className="py-3 px-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {mockDocuments.map((doc) => (
                <DocumentRow key={doc.id} doc={doc} onClick={() => setSelected(doc)} />
              ))}
            </tbody>
          </table>
        </div>
        {selected && <DocumentDetail doc={selected} onClose={() => setSelected(null)} />}
      </div>
    </div>
  );
}
