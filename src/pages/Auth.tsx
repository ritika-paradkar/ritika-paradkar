import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { if (user) navigate("/"); }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { name },
          },
        });
        if (error) throw error;
        toast.success("Account created — signing you in...");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold">LegalEase</h1>
            <p className="text-xs text-muted-foreground">{mode === "signin" ? "Welcome back" : "Create your account"}</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} required className="bg-secondary/30" placeholder="Jane Doe" />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-secondary/30" placeholder="you@firm.com" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="bg-secondary/30" placeholder="••••••••" />
          </div>
          <Button type="submit" disabled={busy} className="w-full gap-2">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "signin" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div className="text-center mt-4 text-sm text-muted-foreground">
          {mode === "signin" ? "No account?" : "Already have an account?"}{" "}
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-primary font-medium hover:underline">
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </div>
        <div className="text-center mt-2">
          <button onClick={() => navigate("/")} className="text-xs text-muted-foreground hover:text-foreground">
            Continue as guest →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
