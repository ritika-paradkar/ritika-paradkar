import { useState } from "react";
import { Settings, Globe, Moon, Sun, Bell, User, Check, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

function SectionCard({ title, icon: Icon, children }: { title: string; icon: typeof Globe; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />{title}
      </h3>
      {children}
    </motion.div>
  );
}

export default function SettingsView() {
  const [language, setLanguage] = useState("en");
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState({
    deadlines: true,
    caseUpdates: true,
    fraudAlerts: true,
    email: false,
    sound: true,
  });
  const [account, setAccount] = useState({
    name: "Admin User",
    email: "admin@legalease.com",
    role: "Senior Legal Analyst",
    org: "LegalEase AI Corp",
  });

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success("Notification preference updated");
  };

  const saveAccount = () => toast.success("Account details saved");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your preferences, appearance, and account details.</p>
      </div>

      {/* Language */}
      <SectionCard title="Language" icon={Globe}>
        <div className="grid grid-cols-3 gap-2">
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => { setLanguage(l.code); toast.success(`Language set to ${l.label}`); }}
              className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                language === l.code
                  ? "bg-primary/10 border-primary/40 text-primary"
                  : "bg-secondary/30 border-border/50 text-muted-foreground hover:bg-secondary/50"
              }`}>
              <span className="text-lg">{l.flag}</span>
              {l.label}
              {language === l.code && <Check className="w-3.5 h-3.5 ml-auto" />}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Theme */}
      <SectionCard title="Appearance" icon={darkMode ? Moon : Sun}>
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-status-suspicious" />}
            <div>
              <p className="text-sm font-medium">{darkMode ? "Dark Mode" : "Light Mode"}</p>
              <p className="text-xs text-muted-foreground">Currently using {darkMode ? "dark" : "light"} theme</p>
            </div>
          </div>
          <Switch checked={darkMode} onCheckedChange={(v) => { setDarkMode(v); toast.success(`Switched to ${v ? "dark" : "light"} mode`); }} />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className={`p-4 rounded-lg border cursor-pointer transition-all ${darkMode ? "bg-primary/10 border-primary/30" : "bg-secondary/30 border-border/50"}`}
            onClick={() => { setDarkMode(true); toast.success("Dark mode enabled"); }}>
            <div className="w-full h-12 rounded bg-[#0f172a] border border-white/10 mb-2 flex items-end p-1.5 gap-1">
              <div className="w-3 h-3 rounded-sm bg-blue-500/50" /><div className="w-6 h-2 rounded-sm bg-white/20" />
            </div>
            <p className="text-xs font-medium text-center">Dark</p>
          </div>
          <div className={`p-4 rounded-lg border cursor-pointer transition-all ${!darkMode ? "bg-primary/10 border-primary/30" : "bg-secondary/30 border-border/50"}`}
            onClick={() => { setDarkMode(false); toast.success("Light mode enabled"); }}>
            <div className="w-full h-12 rounded bg-white border border-gray-200 mb-2 flex items-end p-1.5 gap-1">
              <div className="w-3 h-3 rounded-sm bg-blue-500/30" /><div className="w-6 h-2 rounded-sm bg-gray-300" />
            </div>
            <p className="text-xs font-medium text-center">Light</p>
          </div>
        </div>
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="Notifications" icon={Bell}>
        <div className="space-y-3">
          {[
            { key: "deadlines" as const, label: "Deadline Reminders", desc: "Get alerts for upcoming hearings and submissions" },
            { key: "caseUpdates" as const, label: "Case Updates", desc: "Notify when case status or risk changes" },
            { key: "fraudAlerts" as const, label: "Fraud Alerts", desc: "Immediate alerts for detected fraud patterns" },
            { key: "email" as const, label: "Email Notifications", desc: "Receive notifications via email" },
            { key: "sound" as const, label: "Sound Alerts", desc: "Play sound for urgent notifications" },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch checked={notifications[item.key]} onCheckedChange={() => toggleNotif(item.key)} />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Account */}
      <SectionCard title="Account Details" icon={User}>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</label>
            <Input value={account.name} onChange={e => setAccount(p => ({ ...p, name: e.target.value }))} className="bg-secondary/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email Address</label>
            <Input value={account.email} onChange={e => setAccount(p => ({ ...p, email: e.target.value }))} className="bg-secondary/30" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Role</label>
              <Input value={account.role} onChange={e => setAccount(p => ({ ...p, role: e.target.value }))} className="bg-secondary/30" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Organization</label>
              <Input value={account.org} onChange={e => setAccount(p => ({ ...p, org: e.target.value }))} className="bg-secondary/30" />
            </div>
          </div>
          <Button onClick={saveAccount} className="w-full mt-2 gap-2">
            <Check className="w-4 h-4" />Save Changes
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
