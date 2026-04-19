import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Frame { base64: string; mimeType: string; timestamp: number; }
interface Payload {
  fileName: string;
  kind: "image" | "video";
  frames: Frame[];
  meta: { sizeBytes: number; mimeType: string; width?: number; height?: number; durationSec?: number; frameCount?: number };
  language?: string;
}

const FRAME_PROMPT = `You are a forensic deepfake & image-tampering analyst.
Analyze the provided image for manipulation signals. Return ONLY JSON with this schema:
{
  "authenticity": "real" | "suspicious" | "fake",
  "confidence": <0-100 integer>,
  "signals": {
    "noisePatternConsistent": <boolean>,
    "compressionArtifactsNormal": <boolean>,
    "facialSymmetryNatural": <boolean | null>,
    "skinTextureNatural": <boolean | null>,
    "lightingConsistent": <boolean>,
    "shadowsConsistent": <boolean>,
    "reflectionsConsistent": <boolean>
  },
  "explanation": "<1-2 short sentences citing specific visual evidence>"
}
Set face-related fields to null if no face is present. Be conservative — only flag "fake" with strong evidence.`;

async function analyzeFrame(apiKey: string, frame: Frame): Promise<any | null> {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: FRAME_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this frame." },
            { type: "image_url", image_url: { url: `data:${frame.mimeType};base64,${frame.base64}` } },
          ],
        },
      ],
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    console.error("Frame analysis failed:", resp.status, t.slice(0, 200));
    return { __error: resp.status };
  }
  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content || "";
  try {
    const m = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    return JSON.parse((m ? m[1] : content).trim());
  } catch {
    console.error("Frame JSON parse failed:", content.slice(0, 200));
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const payload: Payload = await req.json();
    const { fileName, kind, frames, meta, language } = payload;
    if (!fileName || !kind || !Array.isArray(frames) || frames.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    console.log(`[analyze-media] ${fileName} kind=${kind} frames=${frames.length}`);

    // Cap frames to prevent runaway cost
    const cappedFrames = frames.slice(0, 20);

    // Parallel frame analysis
    const results = await Promise.all(cappedFrames.map((f) => analyzeFrame(LOVABLE_API_KEY, f)));

    // Detect rate limit / payment issues
    const rate = results.find((r) => r?.__error === 429);
    if (rate) {
      return new Response(JSON.stringify({ error: "Rate limited, please try again later" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const paid = results.find((r) => r?.__error === 402);
    if (paid) {
      return new Response(JSON.stringify({ error: "Credits exhausted. Add funds in Settings > Workspace > Usage" }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const valid = results.filter((r) => r && !r.__error);
    if (valid.length === 0) {
      return new Response(JSON.stringify({ error: "Unable to analyze file. Please upload a clearer version." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Aggregate
    const suspiciousCount = valid.filter((r) => r.authenticity === "suspicious" || r.authenticity === "fake").length;
    const fakeCount = valid.filter((r) => r.authenticity === "fake").length;
    const ratio = suspiciousCount / valid.length;
    const avgConfidence = Math.round(valid.reduce((s, r) => s + (r.confidence || 0), 0) / valid.length);

    let finalStatus: "real" | "suspicious" | "fake";
    if (kind === "video") {
      if (ratio > 0.3 || fakeCount >= Math.ceil(valid.length * 0.2)) finalStatus = "fake";
      else if (ratio >= 0.1) finalStatus = "suspicious";
      else finalStatus = "real";
    } else {
      finalStatus = valid[0].authenticity || "suspicious";
    }

    const riskScore = finalStatus === "fake" ? Math.max(70, 100 - avgConfidence + 50)
                    : finalStatus === "suspicious" ? Math.max(40, 70 - Math.round(avgConfidence / 3))
                    : Math.min(30, 100 - avgConfidence);
    const riskLevel = riskScore >= 70 ? "high" : riskScore >= 40 ? "medium" : "low";

    // Compose explanation
    const allSignals = valid.flatMap((r) => {
      const s = r.signals || {};
      const issues: string[] = [];
      if (s.noisePatternConsistent === false) issues.push("inconsistent noise patterns");
      if (s.compressionArtifactsNormal === false) issues.push("abnormal compression artifacts");
      if (s.facialSymmetryNatural === false) issues.push("unnatural facial symmetry");
      if (s.skinTextureNatural === false) issues.push("unnatural skin texture");
      if (s.lightingConsistent === false) issues.push("inconsistent lighting");
      if (s.shadowsConsistent === false) issues.push("mismatched shadows");
      if (s.reflectionsConsistent === false) issues.push("inconsistent reflections");
      return issues;
    });
    const uniqueIssues = Array.from(new Set(allSignals));
    const explanationParts = valid.slice(0, 3).map((r) => r.explanation).filter(Boolean);
    const summaryText = kind === "video"
      ? `Analyzed ${valid.length} frames from video. ${suspiciousCount} suspicious frame(s) detected (${Math.round(ratio * 100)}%). ${explanationParts[0] || ""}`.trim()
      : (explanationParts[0] || "Image analyzed for manipulation signals.");

    const langSuffix = language === "hi" ? " (विश्लेषण पूर्ण)" : language === "mr" ? " (विश्लेषण पूर्ण)" : "";

    const risks = uniqueIssues.length > 0
      ? uniqueIssues.map((i) => `Detected: ${i}`)
      : finalStatus === "real" ? ["No significant manipulation signals detected"] : ["Potential manipulation signals detected"];

    const alerts = finalStatus === "fake"
      ? [{ type: "danger", message: `Likely manipulated ${kind} — ${suspiciousCount}/${valid.length} suspicious frames` }]
      : finalStatus === "suspicious"
      ? [{ type: "warning", message: `Possible tampering signals — manual review recommended` }]
      : [{ type: "info", message: `${kind === "video" ? "Video" : "Image"} appears authentic` }];

    const today = new Date().toISOString().split("T")[0];
    const timeline = [
      { date: today, event: `${kind === "video" ? "Video" : "Image"} uploaded`, status: "completed" },
      { date: today, event: `${kind === "video" ? `Extracted ${frames.length} frames` : "Frame prepared"}`, status: "completed" },
      { date: today, event: "Deepfake analysis complete", status: "current" },
    ];

    const recommendation = finalStatus === "fake"
      ? { priority: "high", lawyerType: "Digital Forensics Expert", reasoning: "Manipulation signals detected in media", action: "Submit to forensic lab for chain-of-custody verification" }
      : finalStatus === "suspicious"
      ? { priority: "medium", lawyerType: "Evidence Specialist", reasoning: "Some inconsistencies detected", action: "Request original/source file and metadata" }
      : { priority: "low", lawyerType: "General Counsel", reasoning: "Media appears authentic", action: "Proceed with standard evidence handling" };

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const docRecord = {
      file_name: fileName,
      file_type: kind,
      file_size: `${(meta.sizeBytes / 1024 / 1024).toFixed(1)} MB`,
      status: finalStatus,
      risk_level: riskLevel,
      risk_score: Math.min(100, Math.max(0, riskScore)),
      confidence: avgConfidence,
      case_type: kind === "video" ? "Video Evidence" : "Photographic Evidence",
      priority: riskLevel,
      clauses: [],
      risks,
      timeline,
      alerts,
      recommendation,
      precedents: [],
      summary: summaryText + langSuffix,
      similar_case_ids: [],
    };

    const { data: savedDoc, error: insertError } = await supabase
      .from("documents").insert(docRecord).select().single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to save media analysis");
    }

    return new Response(JSON.stringify({
      document: savedDoc,
      similarCases: [],
      matchedClauses: [],
      mediaAnalysis: {
        kind,
        framesAnalyzed: valid.length,
        suspiciousFrames: suspiciousCount,
        fakeFrames: fakeCount,
        ratio: Math.round(ratio * 100),
        signals: uniqueIssues,
      },
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("analyze-media error:", e);
    return new Response(JSON.stringify({ error: "Unable to analyze file. Please upload a clearer version." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
