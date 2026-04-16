import { type CaseEvent } from "@/lib/mockData";
import { CheckCircle, Circle, Clock } from "lucide-react";
import { motion } from "framer-motion";

const statusConfig = {
  completed: { icon: CheckCircle, color: "text-status-real", bg: "bg-status-real", line: "bg-status-real/40" },
  current: { icon: Circle, color: "text-primary", bg: "bg-primary", line: "bg-border" },
  upcoming: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted", line: "bg-border" },
};

export default function CaseTimeline({ events }: { events: CaseEvent[] }) {
  return (
    <div className="space-y-0">
      {events.map((event, i) => {
        const cfg = statusConfig[event.status];
        const Icon = cfg.icon;
        const isLast = i === events.length - 1;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-3"
          >
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${event.status === "current" ? "ring-2 ring-primary/30" : ""}`}>
                <Icon className={`w-4 h-4 ${cfg.color}`} />
              </div>
              {!isLast && <div className={`w-0.5 h-8 ${cfg.line}`} />}
            </div>
            <div className="pb-6">
              <p className={`text-sm font-medium ${event.status === "upcoming" ? "text-muted-foreground" : "text-foreground"}`}>{event.event}</p>
              <p className="text-xs text-muted-foreground">{event.date}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
