import { Scale, LayoutDashboard, Upload, FolderSearch, Users, Database, MessageSquare, GitCompare, Wand2, Map, ShieldAlert, History, Clock, Tag, FileBarChart, Globe, Settings, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { user, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const navSections = [
    { label: t("section.core"), items: [
      { id: "dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
      { id: "upload", label: t("nav.upload"), icon: Upload },
      { id: "repository", label: t("nav.repository"), icon: Database },
      { id: "similar", label: t("nav.similar"), icon: FolderSearch },
      { id: "lawyers", label: t("nav.lawyers"), icon: Users },
    ]},
    { label: t("section.ai"), items: [
      { id: "chat", label: t("nav.chat"), icon: MessageSquare },
      { id: "compare", label: t("nav.compare"), icon: GitCompare },
      { id: "simulator", label: t("nav.simulator"), icon: Wand2 },
      { id: "summary", label: t("nav.summary"), icon: FileBarChart },
    ]},
    { label: t("section.analytics"), items: [
      { id: "heatmap", label: t("nav.heatmap"), icon: Map },
      { id: "fraud", label: t("nav.fraud"), icon: ShieldAlert },
      { id: "tags", label: t("nav.tags"), icon: Tag },
    ]},
    { label: t("section.management"), items: [
      { id: "deadlines", label: t("nav.deadlines"), icon: Clock },
      { id: "versions", label: t("nav.versions"), icon: History },
      { id: "public", label: t("nav.public"), icon: Globe },
      { id: "settings", label: t("nav.settings"), icon: Settings },
    ]},
  ];

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
      <div className="p-3 mx-3 mb-4 rounded-lg bg-secondary/50 border border-border space-y-2">
        {user ? (
          <>
            <div className="flex items-center gap-2 px-1">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <UserIcon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">{user.email}</p>
                <p className="text-[10px] text-muted-foreground">Signed in</p>
              </div>
            </div>
            <button onClick={signOut} className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded text-xs font-medium bg-secondary hover:bg-secondary/70 transition">
              <LogOut className="w-3.5 h-3.5" />{t("auth.signout")}
            </button>
          </>
        ) : (
          <>
            <p className="text-xs text-muted-foreground px-1">{t("auth.guest")}</p>
            <button onClick={() => navigate("/auth")} className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition">
              <LogIn className="w-3.5 h-3.5" />{t("auth.signin")}
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
