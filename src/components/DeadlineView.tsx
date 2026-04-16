import { useState, useEffect } from "react";
import { Clock, AlertTriangle, Calendar, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { mockDocuments } from "@/lib/mockData";
import { supabase } from "@/integrations/supabase/client";

interface Deadline { docName: string; event: string; date: string; daysLeft: number; status: string; }

export default function DeadlineView() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);

  useEffect(() => {
    const collect = async () => {
      const { data } = await supabase.from("documents").select("file_name, timeline").order("created_at", { ascending: false });
      const today = new Date();
      const all: Deadline[] = [];

      // From DB documents
      (data || []).forEach(d => {
        const tl = Array.isArray(d.timeline) ? d.timeline : [];
        tl.forEach((e: any) => {
          if (e.status === "upcoming" && e.date) {
            const eventDate = new Date(e.date);
            const diff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            all.push({ docName: d.file_name, event: e.event, date: e.date, daysLeft: diff, status: e.status });
          }
        });
      });

      // From mock documents
      mockDocuments.forEach(d => {
        d.timeline.forEach(e => {
          if (e.status === "upcoming") {
            const eventDate = new Date(e.date);
            const diff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            all.push({ docName: d.name, event: e.event, date: e.date, daysLeft: diff, status: e.status });
          }
        });
      });

      all.sort((a, b) => a.daysLeft - b.daysLeft);
      setDeadlines(all);
    };
    collect();
  }, []);

  const urgent = deadlines.filter(d => d.daysLeft <= 3);
  const upcoming = deadlines.filter(d => d.daysLeft > 3 && d.daysLeft <= 14);
  const later = deadlines.filter(d => d.daysLeft > 14);

  const getUrgencyClass = (days: number) => {
    if (days <= 1) return "bg-status-fake/10 border-status-fake/30 text-status-fake";
    if (days <= 3) return "bg-status-suspicious/10 border-status-suspicious/30 text-status-suspicious";
    if (days <= 7) return "bg-primary/10 border-primary/30 text-primary";
    return "bg-secondary/40 border-border/50 text-muted-foreground";
  };

  const renderSection = (title: string, items: Deadline[], icon: typeof AlertTriangle, color: string) => items.length > 0 ? (
    <div className="glass-card p-5">
      <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${color}`}>
        {<icon className="w-3.5 h-3.5" />}{title}
        <span className="text-xs ml-auto text-muted-foreground">{items.length} items</span>
      </h3>
      <div className="space-y-2">
        {items.map((d, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 p-3 rounded-lg border ${getUrgencyClass(d.daysLeft)}`}>
            <Bell className="w-4 h-4 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{d.event}</p>
              <p className="text-xs opacity-70">{d.docName}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold">{d.daysLeft <= 0 ? "OVERDUE" : `${d.daysLeft}d`}</p>
              <p className="text-[10px]">{d.date}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2"><Clock className="w-6 h-6 text-primary" />Deadline Reminders</h1>
        <p className="text-muted-foreground text-sm mt-1">Track all upcoming deadlines — hearings, submissions, reviews, and filing dates.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-status-fake">{urgent.length}</p>
          <p className="text-xs text-muted-foreground">Urgent (≤3 days)</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-status-suspicious">{upcoming.length}</p>
          <p className="text-xs text-muted-foreground">Upcoming (≤14 days)</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-bold text-muted-foreground">{later.length}</p>
          <p className="text-xs text-muted-foreground">Later</p>
        </div>
      </div>

      {renderSection("🚨 Urgent Deadlines", urgent, AlertTriangle, "text-status-fake")}
      {renderSection("⏰ Upcoming", upcoming, Calendar, "text-status-suspicious")}
      {renderSection("📅 Later", later, Clock, "text-muted-foreground")}

      {deadlines.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No upcoming deadlines found.</p>
        </div>
      )}
    </div>
  );
}
