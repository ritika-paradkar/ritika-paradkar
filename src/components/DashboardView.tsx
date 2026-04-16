import { mockDocuments, type LegalDocument, type VerificationStatus, type PriorityLevel } from "@/lib/mockData";
import { FileText, Image, Video, CheckCircle, AlertTriangle, XCircle, TrendingUp, Shield, Clock, Volume2, VolumeX, Bot, ShieldCheck, Languages } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import RiskScoreGauge from "@/components/RiskScoreGauge";
import CaseTimeline from "@/components/CaseTimeline";
import AlertPanel from "@/components/AlertPanel";

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
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate max-w-[180px]">{doc.name}</span>
            {doc.status === "real" && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-status-real/15 text-status-real border border-status-real/30">
                <ShieldCheck className="w-2.5 h-2.5" />VERIFIED
              </span>
            )}
          </div>
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
        <RiskScoreGauge score={doc.riskScore} size="sm" />
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

function VoiceExplainButton({ doc }: { doc: LegalDocument }) {
  const [speaking, setSpeaking] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">("en");

  const speak = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const textEn = `This ${doc.caseType} document titled ${doc.name} has a risk score of ${doc.riskScore} out of 100 and is classified as ${doc.status}. Key findings: ${doc.risks.slice(0, 2).join(". ")}. AI Recommendation: ${doc.recommendation.action}`;
    const textHi = `यह ${doc.caseType} दस्तावेज़ ${doc.name} का जोखिम स्कोर ${doc.riskScore} में से 100 है और इसे ${doc.status === "real" ? "असली" : doc.status === "suspicious" ? "संदिग्ध" : "नकली"} के रूप में वर्गीकृत किया गया है। AI सिफारिश: ${doc.recommendation.action}`;

    const utterance = new SpeechSynthesisUtterance(lang === "en" ? textEn : textHi);
    utterance.lang = lang === "en" ? "en-US" : "hi-IN";
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={speak}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${speaking ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80 text-foreground"}`}
      >
        {speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        {speaking ? "Stop" : "Explain"}
      </button>
      <button
        onClick={() => setLang(lang === "en" ? "hi" : "en")}
        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium bg-secondary/60 hover:bg-secondary text-muted-foreground"
        title="Toggle language"
      >
        <Languages className="w-3 h-3" />
        {lang === "en" ? "EN" : "हिं"}
      </button>
    </div>
  );
}

function DocumentDetail({ doc, onClose }: { doc: LegalDocument; onClose: () => void }) {
  const SIcon = statusConfig[doc.status].icon;
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 space-y-5 max-h-[75vh] overflow-y-auto">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-lg font-bold">{doc.name}</h2>
            {doc.status === "real" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-status-real/15 text-status-real border border-status-real/30">
                <ShieldCheck className="w-3 h-3" />VERIFIED EVIDENCE
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{doc.caseType} · {doc.size}</p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
      </div>

      {/* Status + Risk Score */}
      <div className="flex items-center gap-4">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${statusConfig[doc.status].class}`}>
          <SIcon className="w-3 h-3" />{statusConfig[doc.status].label} · {doc.confidence}%
        </span>
        <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${priorityLabels[doc.priority]}`}>
          {doc.priority} priority
        </span>
        <VoiceExplainButton doc={doc} />
      </div>

      {/* Risk Gauge + AI Recommendation */}
      <div className="grid grid-cols-[auto_1fr] gap-4">
        <div className="flex flex-col items-center">
          <RiskScoreGauge score={doc.riskScore} size="lg" />
        </div>
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-primary">AI Recommendation</h3>
          </div>
          <p className="text-xs text-foreground/90 mb-1.5">{doc.recommendation.reasoning}</p>
          <p className="text-xs font-medium text-primary">{doc.recommendation.action}</p>
          <p className="text-[10px] text-muted-foreground mt-1.5">Suggested: {doc.recommendation.lawyerType}</p>
        </div>
      </div>

      {/* Alerts */}
      {doc.alerts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-status-suspicious" />Auto Alerts
          </h3>
          <AlertPanel alerts={doc.alerts} />
        </div>
      )}

      {/* Clauses + Risks + Timeline */}
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
          <h3 className="text-sm font-semibold text-status-suspicious mb-2">Risk Factors</h3>
          <ul className="space-y-1.5">
            {doc.risks.map((r, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <AlertTriangle className="w-3 h-3 text-status-suspicious mt-0.5 shrink-0" />{r}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-primary mb-2">Case Progress</h3>
          <CaseTimeline events={doc.timeline} />
        </div>
      </div>

      {/* Precedents */}
      {doc.precedents.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-primary mb-2">📚 Similar Precedents</h3>
          <div className="space-y-2">
            {doc.precedents.map((p, i) => (
              <div key={i} className="p-3 rounded-lg bg-secondary/40 border border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold">{p.title} ({p.year})</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.outcome === "Guilty" ? "priority-high" : p.outcome === "Not Guilty" ? "priority-low" : "priority-medium"}`}>
                    {p.outcome}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{p.summary}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <div className="h-1 flex-1 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${p.relevance}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{p.relevance}% match</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function DashboardView() {
  const [selected, setSelected] = useState<LegalDocument | null>(null);

  const realCount = mockDocuments.filter((d) => d.status === "real").length;
  const suspiciousCount = mockDocuments.filter((d) => d.status === "suspicious").length;
  const fakeCount = mockDocuments.filter((d) => d.status === "fake").length;
  const highCount = mockDocuments.filter((d) => d.priority === "high").length;
  const highRiskCount = mockDocuments.filter((d) => d.riskScore >= 70).length;
  const avgRisk = Math.round(mockDocuments.reduce((s, d) => s + d.riskScore, 0) / mockDocuments.length);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Lawyer Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">AI-powered overview of all cases, risk analysis, and document verification.</p>
      </div>

      {/* Analytics row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={FileText} label="Total Cases" value={String(mockDocuments.length)} color="bg-primary/10 text-primary" />
        <StatCard icon={Shield} label="Verified" value={String(realCount)} color="bg-status-real/10 text-status-real" />
        <StatCard icon={AlertTriangle} label="Suspicious" value={String(suspiciousCount)} color="bg-status-suspicious/10 text-status-suspicious" />
        <StatCard icon={XCircle} label="Fake Detected" value={String(fakeCount)} color="bg-status-fake/10 text-status-fake" />
        <StatCard icon={TrendingUp} label="High Risk" value={String(highRiskCount)} color="bg-status-fake/10 text-status-fake" />
        <StatCard icon={Clock} label="Avg Risk Score" value={String(avgRisk)} color="bg-status-suspicious/10 text-status-suspicious" />
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: selected ? "1fr 1fr" : "1fr" }}>
        <div className="glass-card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4 font-medium">Document</th>
                <th className="py-3 px-4 font-medium">Case Type</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Risk</th>
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
