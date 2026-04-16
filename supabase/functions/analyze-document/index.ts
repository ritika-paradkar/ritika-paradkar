import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { fileName, fileType, fileSize } = await req.json();
    if (!fileName) {
      return new Response(JSON.stringify({ error: "fileName is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch all clauses from DB
    const { data: dbClauses } = await supabase.from("clauses").select("*");

    // 2. Fetch all cases from DB for similar case matching
    const { data: dbCases } = await supabase.from("cases").select("*");

    const clauseList = (dbClauses || []).map(c => `${c.clause_name} (${c.risk_level} risk): ${c.description}`).join("\n");
    const caseList = (dbCases || []).map(c => `${c.case_type}: ${c.summary} → ${c.outcome}`).join("\n");

    // 3. Call AI to analyze the document
    const systemPrompt = `You are a senior legal document analyst AI. Analyze the uploaded document and return a structured JSON analysis.

Available clauses in our database:
${clauseList}

Available case precedents:
${caseList}

Return ONLY valid JSON with this exact structure:
{
  "status": "real" | "suspicious" | "fake",
  "confidence": <number 0-100>,
  "riskScore": <number 0-100>,
  "caseType": "<string: Employment Law | Real Estate | Criminal Defense | Contract Dispute | Intellectual Property | Fraud | Civil | Immigration>",
  "matchedClauses": ["<clause names that likely appear in this document>"],
  "risks": ["<specific risk factors>"],
  "alerts": [{"type": "danger" | "warning" | "info", "message": "<alert text>"}],
  "timeline": [{"date": "<YYYY-MM-DD>", "event": "<description>", "status": "completed" | "current" | "upcoming"}],
  "recommendation": {
    "priority": "high" | "medium" | "low",
    "lawyerType": "<specialist type>",
    "reasoning": "<why this priority>",
    "action": "<recommended next step>"
  },
  "precedents": [{"title": "<case name>", "year": <number>, "outcome": "<result>", "relevance": <0-100>, "summary": "<brief>"}],
  "similarCaseType": "<case_type for matching>"
}

Rules:
- If risk_level is High → priority High, Medium → Medium, Low → Low
- Match clauses from our database that are likely in this document type
- Find similar cases from our database
- Be realistic and professional in your analysis`;

    const userPrompt = `Analyze this document:
- File name: ${fileName}
- File type: ${fileType}
- File size: ${fileSize}

Based on the filename and type, determine what kind of legal document this is, assess its authenticity, extract likely clauses, identify risks, and find similar cases.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
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
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse AI response - extract JSON from possible markdown code blocks
    let analysis;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      analysis = JSON.parse(jsonMatch[1]!.trim());
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI analysis");
    }

    // 4. Determine risk_level and priority from riskScore
    const riskLevel = analysis.riskScore >= 70 ? "high" : analysis.riskScore >= 40 ? "medium" : "low";
    const priority = riskLevel;

    // 5. Find similar cases from DB
    const { data: similarCases } = await supabase
      .from("cases")
      .select("id")
      .eq("case_type", analysis.caseType || analysis.similarCaseType)
      .limit(5);

    // 6. Build timeline with today's date
    const today = new Date().toISOString().split("T")[0];
    const timeline = analysis.timeline || [
      { date: today, event: "Document uploaded", status: "completed" },
      { date: today, event: "AI verification complete", status: "completed" },
      { date: today, event: `Status: ${analysis.status}`, status: "current" },
    ];

    // 7. Save to documents table
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
      similar_case_ids: (similarCases || []).map(c => c.id),
    };

    const { data: savedDoc, error: insertError } = await supabase
      .from("documents")
      .insert(docRecord)
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to save document analysis");
    }

    // 8. Fetch similar cases details
    const { data: similarCaseDetails } = await supabase
      .from("cases")
      .select("*")
      .eq("case_type", analysis.caseType)
      .limit(5);

    return new Response(JSON.stringify({
      document: savedDoc,
      similarCases: similarCaseDetails || [],
      matchedClauses: (dbClauses || []).filter(c =>
        (analysis.matchedClauses || []).includes(c.clause_name)
      ),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-document error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
