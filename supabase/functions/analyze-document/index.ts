import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_TEXT_LEN = 18000;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { fileName, fileType, fileSize, extractedText, language } = await req.json();
    if (!fileName) {
      return new Response(JSON.stringify({ error: "fileName is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate extracted text — reject if missing or unreadable
    const cleanText = (extractedText || "").toString().trim();
    if (cleanText.length < 80) {
      return new Response(JSON.stringify({
        error: "Document unreadable. Please upload a valid text-based document.",
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const truncated = cleanText.slice(0, MAX_TEXT_LEN);
    console.log(`[analyze-document] ${fileName} | ${truncated.length} chars | preview: ${truncated.slice(0, 200)}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: dbClauses } = await supabase.from("clauses").select("*");
    const { data: dbCases } = await supabase.from("cases").select("*");

    const clauseList = (dbClauses || []).map(c => `${c.clause_name} (${c.risk_level} risk): ${c.description}`).join("\n");
    const caseList = (dbCases || []).map(c => `${c.case_type}: ${c.summary} → ${c.outcome}`).join("\n");

    const langInstruction = language && language !== "en"
      ? `\nIMPORTANT: All textual fields (risks, alert messages, recommendation reasoning/action, summaries) MUST be written in ${language === "hi" ? "Hindi (हिन्दी)" : language === "mr" ? "Marathi (मराठी)" : "English"}. Keep enum keys (status, priority, risk levels) in English.`
      : "";

    const systemPrompt = `You are a senior legal document analyst AI. Analyze the ACTUAL document text provided and return a structured JSON analysis. Do NOT hallucinate — only analyze content present in the text. If the text contains no legal content, set status to "suspicious", caseType "Unknown", and clearly state this in the risks array.

Available clauses in our database:
${clauseList}

Available case precedents:
${caseList}

Return ONLY valid JSON with this exact structure:
{
  "status": "real" | "suspicious" | "fake",
  "confidence": <number 0-100>,
  "riskScore": <number 0-100>,
  "caseType": "<Employment Law | Real Estate | Criminal Defense | Contract Dispute | Intellectual Property | Fraud | Civil | Immigration | Unknown>",
  "matchedClauses": ["<clause names from our DB that actually appear>"],
  "risks": ["<specific risks found in the text>"],
  "alerts": [{"type": "danger" | "warning" | "info", "message": "<alert>"}],
  "timeline": [{"date": "<YYYY-MM-DD>", "event": "<description>", "status": "completed" | "current" | "upcoming"}],
  "recommendation": {
    "priority": "high" | "medium" | "low",
    "lawyerType": "<specialist type>",
    "reasoning": "<why>",
    "action": "<next step>"
  },
  "precedents": [{"title": "<case>", "year": <number>, "outcome": "<result>", "relevance": <0-100>, "summary": "<brief>"}],
  "summary": "<2-3 sentence plain-language summary of THIS document>"
}${langInstruction}`;

    const userPrompt = `Document: ${fileName} (${fileType}, ${fileSize})

--- DOCUMENT TEXT ---
${truncated}
--- END ---

Analyze the document above.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Add funds in Settings > Workspace > Usage" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "Unable to analyze document. Please upload a clearer version." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let analysis: any;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      analysis = JSON.parse(jsonMatch[1]!.trim());
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Unable to analyze document. Please upload a clearer version." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const riskLevel = analysis.riskScore >= 70 ? "high" : analysis.riskScore >= 40 ? "medium" : "low";
    const priority = riskLevel;

    const { data: similarCases } = await supabase
      .from("cases").select("id").eq("case_type", analysis.caseType).limit(5);

    const today = new Date().toISOString().split("T")[0];
    const timeline = analysis.timeline?.length ? analysis.timeline : [
      { date: today, event: "Document uploaded", status: "completed" },
      { date: today, event: "Text extracted", status: "completed" },
      { date: today, event: "AI analysis complete", status: "current" },
    ];

    const docRecord = {
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      status: analysis.status,
      risk_level: riskLevel,
      risk_score: analysis.riskScore,
      confidence: analysis.confidence,
      case_type: analysis.caseType,
      priority,
      clauses: analysis.matchedClauses || [],
      risks: analysis.risks || [],
      timeline,
      alerts: analysis.alerts || [],
      recommendation: analysis.recommendation || {},
      precedents: analysis.precedents || [],
      summary: analysis.summary || null,
      similar_case_ids: (similarCases || []).map(c => c.id),
    };

    const { data: savedDoc, error: insertError } = await supabase
      .from("documents").insert(docRecord).select().single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to save document analysis");
    }

    const { data: similarCaseDetails } = await supabase
      .from("cases").select("*").eq("case_type", analysis.caseType).limit(5);

    return new Response(JSON.stringify({
      document: savedDoc,
      similarCases: similarCaseDetails || [],
      matchedClauses: (dbClauses || []).filter(c =>
        (analysis.matchedClauses || []).includes(c.clause_name)
      ),
      textPreview: truncated.slice(0, 500),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("analyze-document error:", e);
    return new Response(JSON.stringify({ error: "Unable to analyze document. Please upload a clearer version." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
