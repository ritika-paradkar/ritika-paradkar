export type VerificationStatus = "real" | "suspicious" | "fake";
export type PriorityLevel = "high" | "medium" | "low";
export type DocType = "pdf" | "image" | "video";

export interface CaseEvent {
  date: string;
  event: string;
  status: "completed" | "current" | "upcoming";
}

export interface Precedent {
  title: string;
  year: number;
  outcome: "Guilty" | "Not Guilty" | "Settled" | "Dismissed";
  relevance: number; // 0-100
  summary: string;
}

export interface Alert {
  type: "danger" | "warning" | "info";
  message: string;
}

export interface AIRecommendation {
  priority: PriorityLevel;
  lawyerType: string;
  reasoning: string;
  action: string;
}

export interface LegalDocument {
  id: string;
  name: string;
  type: DocType;
  uploadDate: string;
  size: string;
  status: VerificationStatus;
  priority: PriorityLevel;
  caseType: string;
  clauses: string[];
  risks: string[];
  timeline: CaseEvent[];
  confidence: number;
  riskScore: number;
  assignedLawyer?: string;
  alerts: Alert[];
  precedents: Precedent[];
  recommendation: AIRecommendation;
}

export interface Lawyer {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  activeCases: number;
  maxCases: number;
  availability: "available" | "busy" | "unavailable";
  email: string;
  rating: number;
  avatar: string;
}

export const mockLawyers: Lawyer[] = [
  { id: "L1", name: "Sarah Chen", specialization: "Employment Law", experience: 12, activeCases: 3, maxCases: 8, availability: "available", email: "s.chen@legalease.com", rating: 4.9, avatar: "SC" },
  { id: "L2", name: "Marcus Johnson", specialization: "Criminal Defense", experience: 18, activeCases: 7, maxCases: 8, availability: "busy", email: "m.johnson@legalease.com", rating: 4.7, avatar: "MJ" },
  { id: "L3", name: "Priya Patel", specialization: "Intellectual Property", experience: 9, activeCases: 4, maxCases: 10, availability: "available", email: "p.patel@legalease.com", rating: 4.8, avatar: "PP" },
  { id: "L4", name: "David Kim", specialization: "Real Estate", experience: 15, activeCases: 6, maxCases: 6, availability: "unavailable", email: "d.kim@legalease.com", rating: 4.6, avatar: "DK" },
  { id: "L5", name: "Elena Rodriguez", specialization: "Contract Dispute", experience: 7, activeCases: 2, maxCases: 8, availability: "available", email: "e.rodriguez@legalease.com", rating: 4.5, avatar: "ER" },
  { id: "L6", name: "James Wright", specialization: "Immigration", experience: 11, activeCases: 5, maxCases: 8, availability: "available", email: "j.wright@legalease.com", rating: 4.8, avatar: "JW" },
];

export const mockDocuments: LegalDocument[] = [
  {
    id: "1", name: "Employment_Agreement_2024.pdf", type: "pdf", uploadDate: "2026-04-14", size: "2.4 MB",
    status: "real", priority: "high", caseType: "Employment Law", confidence: 94, riskScore: 72, assignedLawyer: "L1",
    clauses: ["Non-compete clause (Section 4.2)", "Termination without cause (Section 7.1)", "IP assignment (Section 5.3)", "Confidentiality obligations (Section 6)"],
    risks: ["Non-compete may be unenforceable in California", "No severance clause included", "IP assignment is overly broad"],
    timeline: [
      { date: "2026-04-14", event: "Document uploaded", status: "completed" },
      { date: "2026-04-14", event: "Verification passed", status: "completed" },
      { date: "2026-04-15", event: "Analysis complete", status: "completed" },
      { date: "2026-04-15", event: "Priority assigned: High", status: "current" },
      { date: "2026-04-20", event: "Lawyer review deadline", status: "upcoming" },
    ],
    alerts: [
      { type: "warning", message: "Non-compete clause may be unenforceable in California jurisdictions" },
      { type: "danger", message: "IP assignment scope is overly broad — could expose client" },
    ],
    precedents: [
      { title: "Edwards v. Arthur Andersen LLP", year: 2008, outcome: "Not Guilty", relevance: 89, summary: "California Supreme Court ruled non-compete clauses unenforceable under Business & Professions Code §16600." },
      { title: "Brown v. TeleCom Corp", year: 2021, outcome: "Settled", relevance: 74, summary: "Overly broad IP assignment clause was struck down; employer awarded partial rights only." },
    ],
    recommendation: { priority: "high", lawyerType: "Senior Employment Attorney", reasoning: "High-risk clauses detected with potential unenforceability issues. Requires experienced counsel.", action: "Immediate review of non-compete and IP clauses recommended." },
  },
  {
    id: "2", name: "Property_Deed_Scan.jpg", type: "image", uploadDate: "2026-04-13", size: "5.1 MB",
    status: "suspicious", priority: "high", caseType: "Real Estate", confidence: 62, riskScore: 85, assignedLawyer: "L4",
    clauses: ["Transfer of ownership (Page 1)", "Easement rights (Page 2)", "Zoning restrictions mentioned"],
    risks: ["Signature appears altered", "Notary stamp inconsistency", "Missing witness signatures"],
    timeline: [
      { date: "2026-04-13", event: "Document uploaded", status: "completed" },
      { date: "2026-04-13", event: "Verification flagged suspicious", status: "completed" },
      { date: "2026-04-14", event: "Manual review initiated", status: "current" },
      { date: "2026-04-18", event: "Expert forensic review", status: "upcoming" },
    ],
    alerts: [
      { type: "danger", message: "Signature appears digitally altered — possible forgery" },
      { type: "danger", message: "Notary stamp inconsistency detected" },
      { type: "warning", message: "Missing witness signatures" },
    ],
    precedents: [
      { title: "State v. Reeves", year: 2019, outcome: "Guilty", relevance: 92, summary: "Forged property deed led to fraud conviction. Altered signatures were key evidence." },
      { title: "Martinez v. County Registrar", year: 2022, outcome: "Dismissed", relevance: 67, summary: "Deed with notary inconsistencies was invalidated; property returned to original owner." },
    ],
    recommendation: { priority: "high", lawyerType: "Senior Real Estate Litigator", reasoning: "Multiple forgery indicators detected. Document integrity is compromised.", action: "Suspend all transactions related to this deed. Order forensic analysis." },
  },
  {
    id: "3", name: "Witness_Testimony.mp4", type: "video", uploadDate: "2026-04-12", size: "48 MB",
    status: "real", priority: "medium", caseType: "Criminal Defense", confidence: 88, riskScore: 45, assignedLawyer: "L2",
    clauses: ["Witness identifies suspect at 2:34", "Alibi contradiction at 5:12", "Character reference at 8:00"],
    risks: ["Low video quality in key segment", "Audio inconsistency detected at 3:15"],
    timeline: [
      { date: "2026-04-12", event: "Video uploaded", status: "completed" },
      { date: "2026-04-12", event: "Deepfake scan passed", status: "completed" },
      { date: "2026-04-13", event: "Transcription complete", status: "completed" },
      { date: "2026-04-14", event: "Assigned to counsel", status: "current" },
      { date: "2026-04-25", event: "Court submission deadline", status: "upcoming" },
    ],
    alerts: [
      { type: "warning", message: "Audio quality drops at timestamp 3:15 — may be challenged in court" },
      { type: "info", message: "Alibi contradiction detected at 5:12 — review recommended" },
    ],
    precedents: [
      { title: "People v. Harris", year: 2020, outcome: "Guilty", relevance: 78, summary: "Witness video testimony with audio inconsistencies was admitted but given reduced weight." },
    ],
    recommendation: { priority: "medium", lawyerType: "Criminal Defense Attorney", reasoning: "Video is authentic but has quality issues that may affect admissibility.", action: "Enhance audio segment and prepare counter-arguments for opposing counsel." },
  },
  {
    id: "4", name: "Insurance_Claim_Form.pdf", type: "pdf", uploadDate: "2026-04-11", size: "1.2 MB",
    status: "fake", priority: "high", caseType: "Contract Dispute", confidence: 23, riskScore: 96,
    clauses: ["Claim amount: $45,000", "Incident description (Section 2)", "Policy number referenced"],
    risks: ["Document metadata inconsistent with creation date", "Font mismatch detected on page 2", "Digital signature invalid"],
    timeline: [
      { date: "2026-04-11", event: "Document uploaded", status: "completed" },
      { date: "2026-04-11", event: "Verification failed — FAKE", status: "completed" },
      { date: "2026-04-11", event: "Document rejected & flagged", status: "completed" },
      { date: "2026-04-12", event: "Fraud report generated", status: "current" },
    ],
    alerts: [
      { type: "danger", message: "FRAUDULENT DOCUMENT — Digital signature is invalid" },
      { type: "danger", message: "Metadata timestamp does not match claimed creation date" },
      { type: "danger", message: "Font mismatch on page 2 indicates post-creation editing" },
    ],
    precedents: [
      { title: "United States v. Patel", year: 2023, outcome: "Guilty", relevance: 95, summary: "Fabricated insurance claim with metadata inconsistencies led to 3-year sentence for insurance fraud." },
      { title: "Insurer Corp v. Davis", year: 2021, outcome: "Guilty", relevance: 88, summary: "Forged claim form detected through font analysis. $200K restitution ordered." },
    ],
    recommendation: { priority: "high", lawyerType: "Fraud Investigation Specialist", reasoning: "Document confirmed as fabricated. Multiple forensic indicators of fraud.", action: "Report to authorities. Do NOT process claim. Preserve all evidence." },
  },
  {
    id: "5", name: "Patent_Filing_Draft.pdf", type: "pdf", uploadDate: "2026-04-10", size: "3.8 MB",
    status: "real", priority: "low", caseType: "Intellectual Property", confidence: 97, riskScore: 18, assignedLawyer: "L3",
    clauses: ["Claims 1-12 defined", "Prior art references (Section 3)", "Abstract and specification complete"],
    risks: ["Claim 7 may overlap with existing patent US10234567", "Drawings need higher resolution"],
    timeline: [
      { date: "2026-04-10", event: "Draft uploaded", status: "completed" },
      { date: "2026-04-10", event: "Verification passed", status: "completed" },
      { date: "2026-04-11", event: "Prior art analysis complete", status: "completed" },
      { date: "2026-04-15", event: "Attorney review", status: "current" },
      { date: "2026-07-10", event: "Filing deadline", status: "upcoming" },
    ],
    alerts: [
      { type: "info", message: "Claim 7 has potential overlap with US10234567 — review prior art" },
    ],
    precedents: [
      { title: "TechCo v. InnovateLab", year: 2022, outcome: "Settled", relevance: 71, summary: "Patent overlap resolved through cross-licensing agreement after initial filing dispute." },
    ],
    recommendation: { priority: "low", lawyerType: "IP Attorney", reasoning: "Document is authentic with minor prior art concerns. Standard filing process.", action: "Review Claim 7 for overlap. Proceed with filing timeline." },
  },
  {
    id: "6", name: "Lease_Agreement.pdf", type: "pdf", uploadDate: "2026-04-09", size: "1.8 MB",
    status: "suspicious", priority: "medium", caseType: "Real Estate", confidence: 55, riskScore: 68, assignedLawyer: "L4",
    clauses: ["Rent escalation clause (Section 3.4)", "Maintenance responsibilities (Section 5)", "Early termination penalty (Section 8.2)"],
    risks: ["Escalation rate above market average", "Ambiguous maintenance language", "Penalty clause may be unenforceable"],
    timeline: [
      { date: "2026-04-09", event: "Document uploaded", status: "completed" },
      { date: "2026-04-09", event: "Verification flagged suspicious", status: "completed" },
      { date: "2026-04-10", event: "Clause analysis complete", status: "completed" },
      { date: "2026-04-12", event: "Under attorney review", status: "current" },
      { date: "2027-01-01", event: "Lease renewal date", status: "upcoming" },
    ],
    alerts: [
      { type: "warning", message: "Rent escalation of 12% annually exceeds market average (3-5%)" },
      { type: "warning", message: "Early termination penalty may be unenforceable in this jurisdiction" },
    ],
    precedents: [
      { title: "Tenant Union v. Metro Properties", year: 2020, outcome: "Not Guilty", relevance: 82, summary: "Excessive rent escalation clause deemed unconscionable. Tenant awarded damages." },
      { title: "Park v. Skyline Realty", year: 2023, outcome: "Settled", relevance: 76, summary: "Early termination penalty reduced by court from $15K to $3K as original was deemed punitive." },
    ],
    recommendation: { priority: "medium", lawyerType: "Real Estate Attorney", reasoning: "Suspicious clauses with above-market escalation rates. May disadvantage client.", action: "Negotiate escalation rate and termination terms before signing." },
  },
];

export function getVerificationResult(): { status: VerificationStatus; confidence: number; riskScore: number } {
  const rand = Math.random();
  if (rand < 0.5) return { status: "real", confidence: 85 + Math.floor(Math.random() * 15), riskScore: 10 + Math.floor(Math.random() * 30) };
  if (rand < 0.8) return { status: "suspicious", confidence: 40 + Math.floor(Math.random() * 30), riskScore: 50 + Math.floor(Math.random() * 30) };
  return { status: "fake", confidence: 10 + Math.floor(Math.random() * 25), riskScore: 80 + Math.floor(Math.random() * 20) };
}

export function getMockAnalysis() {
  return {
    clauses: ["Standard liability clause (Section 2.1)", "Indemnification terms (Section 4.3)", "Force majeure (Section 9)"],
    risks: ["Liability cap may be insufficient", "No dispute resolution mechanism specified"],
    timeline: [
      { date: "2026-04-16", event: "Document uploaded", status: "completed" as const },
      { date: "2026-04-16", event: "Verification complete", status: "completed" as const },
      { date: "2026-04-17", event: "Analysis in progress", status: "current" as const },
      { date: "2026-04-23", event: "Review deadline", status: "upcoming" as const },
    ],
    alerts: [
      { type: "warning" as const, message: "Liability cap may be insufficient for this contract value" },
      { type: "info" as const, message: "No dispute resolution mechanism — recommend adding arbitration clause" },
    ],
    recommendation: {
      priority: "medium" as PriorityLevel,
      lawyerType: "Contract Attorney",
      reasoning: "Standard contract with moderate risk factors. Requires attention to liability and dispute resolution.",
      action: "Add arbitration clause and review liability cap before execution.",
    },
  };
}

export function getSimilarCases(caseType: string): LegalDocument[] {
  return mockDocuments.filter((d) => d.caseType === caseType);
}
