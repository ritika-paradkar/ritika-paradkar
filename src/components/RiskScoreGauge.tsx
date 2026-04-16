import { motion } from "framer-motion";

interface RiskScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export default function RiskScoreGauge({ score, size = "md" }: RiskScoreGaugeProps) {
  const dims = size === "sm" ? 64 : size === "md" ? 96 : 128;
  const stroke = size === "sm" ? 6 : 8;
  const radius = (dims - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 70 ? "hsl(var(--status-fake))" : score >= 40 ? "hsl(var(--status-suspicious))" : "hsl(var(--status-real))";
  const label = score >= 70 ? "High Risk" : score >= 40 ? "Medium" : "Low Risk";
  const textSize = size === "sm" ? "text-sm" : size === "md" ? "text-lg" : "text-2xl";
  const labelSize = size === "sm" ? "text-[8px]" : "text-[10px]";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: dims, height: dims }}>
      <svg width={dims} height={dims} className="-rotate-90">
        <circle cx={dims / 2} cy={dims / 2} r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth={stroke} />
        <motion.circle
          cx={dims / 2} cy={dims / 2} r={radius} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`${textSize} font-bold font-heading`} style={{ color }}>{score}</span>
        <span className={`${labelSize} text-muted-foreground`}>{label}</span>
      </div>
    </div>
  );
}
