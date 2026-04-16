import { useState, useEffect } from "react";
import { Tag, FileText, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SmartTagsView() {
  const [docs, setDocs] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [generating, setGenerating] = useState<string>("");

  const fetchDocs = async () => {
    const { data } = await supabase.from("documents").select("id, file_name, tags, case_type, status, risk_score, summary")
      .order("created_at", { ascending: false });
    if (data) setDocs(data);
  };

  useEffect(() => { fetchDocs(); }, []);

  // Collect all tags
  const allTags = Array.from(new Set(docs.flatMap(d => Array.isArray(d.tags) ? d.tags : []))).filter(Boolean);
  const tagCounts = allTags.reduce((acc, t) => {
    acc[t] = docs.filter(d => Array.isArray(d.tags) && d.tags.includes(t)).length;
    return acc;
  }, {} as Record<string, number>);

  const filtered = selectedTag ? docs.filter(d => Array.isArray(d.tags) && d.tags.includes(selectedTag)) : docs;

  const generateTags = async (docId: string) => {
    setGenerating(docId);
    try {
      const { data, error } = await supabase.functions.invoke("generate-summary", { body: { documentId: docId } });
      if (error) throw error;
      toast.success("Tags and summary generated!");
      fetchDocs();
    } catch (e: any) {
      toast.error(e.message || "Failed to generate tags");
    } finally { setGenerating(""); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2"><Tag className="w-6 h-6 text-primary" />Smart Tagging System</h1>
        <p className="text-muted-foreground text-sm mt-1">AI auto-tags documents by category — Fraud, Property, Criminal, Employment, etc. Click tags to filter.</p>
      </div>

      {allTags.length > 0 && (
        <div className="glass-card p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Filter by Tag</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelectedTag("")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${!selectedTag ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/40 text-muted-foreground border-border/50 hover:bg-secondary"}`}>
              All ({docs.length})
            </button>
            {allTags.sort((a, b) => (tagCounts[b] || 0) - (tagCounts[a] || 0)).map(tag => (
              <button key={tag} onClick={() => setSelectedTag(tag === selectedTag ? "" : tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedTag === tag ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/40 text-muted-foreground border-border/50 hover:bg-secondary"}`}>
                {tag} ({tagCounts[tag]})
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((d, i) => (
          <motion.div key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
            className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium">{d.file_name}</p>
              </div>
              {(!d.tags || d.tags.length === 0) && (
                <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => generateTags(d.id)} disabled={generating === d.id}>
                  {generating === d.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Auto-Tag
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {Array.isArray(d.tags) && d.tags.map((t: string) => (
                <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">{t}</span>
              ))}
              <span className="text-xs text-muted-foreground">{d.case_type} · Risk: {d.risk_score}</span>
            </div>
            {d.summary && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{d.summary}</p>}
          </motion.div>
        ))}
      </div>

      {docs.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Tag className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No documents to tag yet. Analyze some documents first.</p>
        </div>
      )}
    </div>
  );
}
