import { Scale, LayoutDashboard, Upload, FolderSearch, Users, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "upload", label: "Upload & Verify", icon: Upload },
  { id: "repository", label: "Repository", icon: Database },
  { id: "similar", label: "Similar Cases", icon: FolderSearch },
  { id: "lawyers", label: "Lawyers", icon: Users },
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
      <nav className="flex-1 px-3 mt-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
              activeView === item.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 mx-3 mb-4 rounded-lg bg-secondary/50 border border-border">
        <p className="text-xs text-muted-foreground">Prototype Mode</p>
        <p className="text-xs text-muted-foreground mt-1">Using mock verification engine</p>
      </div>
    </aside>
  );
}
