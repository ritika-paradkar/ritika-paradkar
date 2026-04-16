export type VerificationStatus = "real" | "suspicious" | "fake";
export type PriorityLevel = "high" | "medium" | "low";
export type DocType = "pdf" | "image" | "video";

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
  timeline: { date: string; event: string }[];
  confidence: number;
}

const caseTypes = ["Contract Dispute", "Employment Law", "Intellectual Property", "Real Estate", "Criminal Defense", "Immigration"];

export const mockDocuments: LegalDocument[] = [
  {
    id: "1",
    name: "Employment_Agreement_2024.pdf",
    type: "pdf",
    uploadDate: "2026-04-14",
    size: "2.4 MB",
    status: "real",
    priority: "high",
    caseType: "Employment Law",
    confidence: 94,
    clauses: ["Non-compete clause (Section 4.2)", "Termination without cause (Section 7.1)", "Intellectual property assignment (Section 5.3)", "Confidentiality obligations (Section 6)"],
    risks: ["Non-compete may be unenforceable in California", "No severance clause included", "IP assignment is overly broad"],
    timeline: [{ date: "2024-01-15", event: "Contract signed" }, { date: "2024-06-01", event: "Probation ends" }, { date: "2025-01-15", event: "First annual review" }],
  },
  {
    id: "2",
    name: "Property_Deed_Scan.jpg",
    type: "image",
    uploadDate: "2026-04-13",
    size: "5.1 MB",
    status: "suspicious",
    priority: "high",
    caseType: "Real Estate",
    confidence: 62,
    clauses: ["Transfer of ownership (Page 1)", "Easement rights (Page 2)", "Zoning restrictions mentioned"],
    risks: ["Signature appears altered", "Notary stamp inconsistency", "Missing witness signatures"],
    timeline: [{ date: "2023-03-10", event: "Deed dated" }, { date: "2023-03-12", event: "Notarized" }],
  },
  {
    id: "3",
    name: "Witness_Testimony.mp4",
    type: "video",
    uploadDate: "2026-04-12",
    size: "48 MB",
    status: "real",
    priority: "medium",
    caseType: "Criminal Defense",
    confidence: 88,
    clauses: ["Witness identifies suspect at 2:34", "Alibi contradiction at 5:12", "Character reference at 8:00"],
    risks: ["Low video quality in key segment", "Audio inconsistency detected at 3:15"],
    timeline: [{ date: "2026-04-10", event: "Testimony recorded" }, { date: "2026-04-12", event: "Uploaded for review" }],
  },
  {
    id: "4",
    name: "Insurance_Claim_Form.pdf",
    type: "pdf",
    uploadDate: "2026-04-11",
    size: "1.2 MB",
    status: "fake",
    priority: "high",
    caseType: "Contract Dispute",
    confidence: 23,
    clauses: ["Claim amount: $45,000", "Incident description (Section 2)", "Policy number referenced"],
    risks: ["Document metadata inconsistent with creation date", "Font mismatch detected on page 2", "Digital signature invalid"],
    timeline: [{ date: "2026-03-01", event: "Incident date claimed" }, { date: "2026-04-11", event: "Claim filed" }],
  },
  {
    id: "5",
    name: "Patent_Filing_Draft.pdf",
    type: "pdf",
    uploadDate: "2026-04-10",
    size: "3.8 MB",
    status: "real",
    priority: "low",
    caseType: "Intellectual Property",
    confidence: 97,
    clauses: ["Claims 1-12 defined", "Prior art references (Section 3)", "Abstract and specification complete"],
    risks: ["Claim 7 may overlap with existing patent US10234567", "Drawings need higher resolution"],
    timeline: [{ date: "2026-02-15", event: "Draft started" }, { date: "2026-04-10", event: "Ready for filing" }, { date: "2026-07-10", event: "Filing deadline" }],
  },
  {
    id: "6",
    name: "Lease_Agreement.pdf",
    type: "pdf",
    uploadDate: "2026-04-09",
    size: "1.8 MB",
    status: "suspicious",
    priority: "medium",
    caseType: "Real Estate",
    confidence: 55,
    clauses: ["Rent escalation clause (Section 3.4)", "Maintenance responsibilities (Section 5)", "Early termination penalty (Section 8.2)"],
    risks: ["Escalation rate above market average", "Ambiguous maintenance language", "Penalty clause may be unenforceable"],
    timeline: [{ date: "2026-01-01", event: "Lease start" }, { date: "2027-01-01", event: "Lease renewal" }],
  },
];

export function getVerificationResult(): { status: VerificationStatus; confidence: number } {
  const rand = Math.random();
  if (rand < 0.5) return { status: "real", confidence: 85 + Math.floor(Math.random() * 15) };
  if (rand < 0.8) return { status: "suspicious", confidence: 40 + Math.floor(Math.random() * 30) };
  return { status: "fake", confidence: 10 + Math.floor(Math.random() * 25) };
}

export function getMockAnalysis() {
  return {
    clauses: ["Standard liability clause (Section 2.1)", "Indemnification terms (Section 4.3)", "Force majeure (Section 9)"],
    risks: ["Liability cap may be insufficient", "No dispute resolution mechanism specified"],
    timeline: [{ date: "2026-04-16", event: "Document uploaded" }, { date: "2026-04-23", event: "Review deadline" }],
  };
}

export function getSimilarCases(caseType: string): LegalDocument[] {
  return mockDocuments.filter((d) => d.caseType === caseType);
}
