// Client-side document text extraction (PDF, DOCX, images via OCR)
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Use bundled worker via Vite
// @ts-ignore
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export type ExtractKind = "pdf" | "docx" | "image" | "text" | "unsupported";

export function detectKind(file: File): ExtractKind {
  const name = file.name.toLowerCase();
  const ext = name.split(".").pop() || "";
  if (ext === "pdf") return "pdf";
  if (["docx"].includes(ext)) return "docx";
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)) return "image";
  if (["txt", "md"].includes(ext)) return "text";
  return "unsupported";
}

function clean(text: string): string {
  return text
    // strip control & non-printable except newlines/tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ")
    .replace(/\uFFFD/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function readableRatio(text: string): number {
  if (!text) return 0;
  const readable = text.match(/[a-zA-Z0-9\s.,;:'"!?()\-\n]/g)?.length || 0;
  return readable / text.length;
}

export async function extractFromPdf(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let out = "";
  const maxPages = Math.min(pdf.numPages, 30);
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((it: any) => it.str).filter(Boolean);
    out += strings.join(" ") + "\n\n";
  }
  return out;
}

export async function extractFromDocx(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
  return value || "";
}

export async function extractFromImage(file: File, onProgress?: (p: number) => void): Promise<string> {
  // Lazy import — tesseract is heavy
  const Tesseract = (await import("tesseract.js")).default;
  const { data } = await Tesseract.recognize(file, "eng", {
    logger: (m: any) => {
      if (m.status === "recognizing text" && onProgress) onProgress(Math.round(m.progress * 100));
    },
  });
  return data.text || "";
}

export async function extractFromText(file: File): Promise<string> {
  return await file.text();
}

export interface ExtractResult {
  kind: ExtractKind;
  text: string;
  cleanText: string;
  readable: boolean;
  reason?: string;
}

const MIN_LEN = 80;
const MIN_READABLE_RATIO = 0.7;

export async function extractText(
  file: File,
  onProgress?: (msg: string, pct?: number) => void,
): Promise<ExtractResult> {
  const kind = detectKind(file);
  onProgress?.(`Extracting text (${kind})...`);
  let raw = "";
  try {
    if (kind === "pdf") raw = await extractFromPdf(file);
    else if (kind === "docx") raw = await extractFromDocx(file);
    else if (kind === "image") raw = await extractFromImage(file, (p) => onProgress?.("OCR...", p));
    else if (kind === "text") raw = await extractFromText(file);
    else {
      return { kind, text: "", cleanText: "", readable: false, reason: "Unsupported file type" };
    }
  } catch (e: any) {
    return { kind, text: "", cleanText: "", readable: false, reason: e?.message || "Extraction failed" };
  }

  const cleaned = clean(raw);
  const ratio = readableRatio(cleaned);
  const readable = cleaned.length >= MIN_LEN && ratio >= MIN_READABLE_RATIO;
  return {
    kind,
    text: raw,
    cleanText: cleaned,
    readable,
    reason: readable
      ? undefined
      : cleaned.length < MIN_LEN
      ? "Document unreadable. Please upload a valid text-based document."
      : "Document contains too many unreadable characters.",
  };
}
