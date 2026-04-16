import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import type { VerificationStatus, PriorityLevel } from "@/lib/mockData";

export interface DashboardFilters {
  search: string;
  status: VerificationStatus | "all";
  priority: PriorityLevel | "all";
  caseType: string;
  riskRange: [number, number];
}

const STATUS_OPTIONS: { value: VerificationStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "real", label: "Verified" },
  { value: "suspicious", label: "Suspicious" },
  { value: "fake", label: "Fake" },
];

const PRIORITY_OPTIONS: { value: PriorityLevel | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

interface Props {
  filters: DashboardFilters;
  onChange: (f: DashboardFilters) => void;
  caseTypes: string[];
}

export default function DashboardFiltersBar({ filters, onChange, caseTypes }: Props) {
  const [open, setOpen] = useState(false);

  const hasActive =
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.caseType !== "" ||
    filters.riskRange[0] !== 0 ||
    filters.riskRange[1] !== 100;

  const clearAll = () =>
    onChange({ search: filters.search, status: "all", priority: "all", caseType: "", riskRange: [0, 100] });

  return (
    <div className="glass-card p-4 space-y-3">
      {/* Search + toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents, case types…"
            className="pl-9 bg-secondary/40 border-border/50"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
          />
        </div>
        <button
          onClick={() => setOpen(!open)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
            open || hasActive
              ? "bg-primary/10 text-primary border-primary/30"
              : "bg-secondary/40 text-muted-foreground border-border/50 hover:bg-secondary"
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
          {hasActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          )}
        </button>
        {hasActive && (
          <button onClick={clearAll} className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3 h-3" />Clear
          </button>
        )}
      </div>

      {/* Filter chips */}
      {open && (
        <div className="flex flex-wrap gap-4 pt-1">
          {/* Status */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</p>
            <div className="flex gap-1.5">
              {STATUS_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => onChange({ ...filters, status: o.value })}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                    filters.status === o.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/40 text-muted-foreground border-border/50 hover:bg-secondary"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Priority</p>
            <div className="flex gap-1.5">
              {PRIORITY_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => onChange({ ...filters, priority: o.value })}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                    filters.priority === o.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/40 text-muted-foreground border-border/50 hover:bg-secondary"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Case Type */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Case Type</p>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => onChange({ ...filters, caseType: "" })}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                  filters.caseType === ""
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary/40 text-muted-foreground border-border/50 hover:bg-secondary"
                }`}
              >
                All
              </button>
              {caseTypes.map((ct) => (
                <button
                  key={ct}
                  onClick={() => onChange({ ...filters, caseType: ct })}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                    filters.caseType === ct
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/40 text-muted-foreground border-border/50 hover:bg-secondary"
                  }`}
                >
                  {ct}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Score Range */}
          <div className="space-y-1.5 min-w-[180px]">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Risk Score: {filters.riskRange[0]}–{filters.riskRange[1]}
            </p>
            <Slider
              min={0}
              max={100}
              step={5}
              value={filters.riskRange}
              onValueChange={(v) => onChange({ ...filters, riskRange: v as [number, number] })}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
