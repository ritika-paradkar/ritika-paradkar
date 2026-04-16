import { Scale, LayoutDashboard, Upload, FolderSearch, Users, Database, MessageSquare, GitCompare, Wand2, Map, ShieldAlert, History, Clock, Tag, FileBarChart, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navSections = [
  {
    label: "Core",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "upload", label: "Upload & Verify", icon: Upload },
      { id: "repository", label: "Repository", icon: Database },
      { id: "similar", label: "Similar Cases", icon: FolderSearch },
      { id: "lawyers", label: "Lawyers", icon: Users },
    ],
  },
  {
    label: "AI Tools",
    items: [
      { id: "chat", label: "Legal Assistant", icon: MessageSquare },
      { id: "compare", label: "Clause Compare", icon: GitCompare },
      { id: "simulator", label: "Risk Simulator", icon: Wand2 },
      { id: "summary", label: "Case Summary", icon: FileBarChart },
    ],
  },
  {
    label: "Analytics",
    items: [
      { id: "heatmap", label: "Case Heatmap", icon: Map },
      { id: "fraud", label: "Fraud Detection", icon: ShieldAlert },
      { id: "tags", label: "Smart Tags", icon: Tag },
    ],
  },
  {
    label: "Management",
    items: [
      { id: "deadlines", label: "Deadlines", icon: Clock },
      { id: "versions", label: "Version History", icon: History },
      { id: "public", label: "Public Mode", icon: Globe },
    ],
  },
];

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-card border-r border-border flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
          <Scale className="w-5 h-5 text-primary" />
        </div>
        <span className="font-heading text-xl font-bold text-foreground">LegalEase</span>
      </div>
      <ScrollArea className="flex-1 px-3">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-1.5">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                    activeView === item.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>
      <div className="p-4 mx-3 mb-4 rounded-lg bg-secondary/50 border border-border">
        <p className="text-xs text-muted-foreground">AI-Powered Legal Platform</p>
        <p className="text-xs text-muted-foreground mt-1">13 features · Real-time analysis</p>
      </div>
    </aside>
  );
}
