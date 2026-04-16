import { type Alert } from "@/lib/mockData";
import { AlertTriangle, XOctagon, Info } from "lucide-react";
import { motion } from "framer-motion";

const alertConfig = {
  danger: { icon: XOctagon, bg: "bg-status-fake/10 border-status-fake/30", text: "text-status-fake" },
  warning: { icon: AlertTriangle, bg: "bg-status-suspicious/10 border-status-suspicious/30", text: "text-status-suspicious" },
  info: { icon: Info, bg: "bg-primary/10 border-primary/30", text: "text-primary" },
};

export default function AlertPanel({ alerts }: { alerts: Alert[] }) {
  if (!alerts.length) return null;
  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => {
        const cfg = alertConfig[alert.type];
        const Icon = cfg.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border ${cfg.bg}`}
          >
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.text}`} />
            <p className="text-xs text-foreground/90">{alert.message}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
