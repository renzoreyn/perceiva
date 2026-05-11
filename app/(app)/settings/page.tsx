"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Moon, Globe, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CURRENCIES } from "@/types";
import type { Currency } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [homeCurrency, setHomeCurrency] = useState<Currency>("USD");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        setName(user.user_metadata?.full_name ?? "");
      }
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    await supabase.auth.updateUser({ data: { full_name: name } });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "U";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="apple-card p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <User className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Profile</h2>
        </div>

        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{name || "Your name"}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Badge variant="muted" className="text-[10px] mt-1">
              {user?.app_metadata?.provider === "google" ? "Google account" : "Email account"}
            </Badge>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Display name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="space-y-1.5">
            <Label>Home currency</Label>
            <Select value={homeCurrency} onValueChange={v => setHomeCurrency(v as Currency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map(c => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2">{c.flag} {c.code} — {c.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">All USD values will also be shown in this currency</p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : saved ? "✓ Saved" : "Save changes"}
        </Button>
      </motion.div>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="apple-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Moon className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Appearance</h2>
        </div>

        {[
          { label: "Dark mode", desc: "Switch between Starlight and Space Grey", checked: resolvedTheme === "dark", onChange: (v: boolean) => setTheme(v ? "dark" : "light") },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Switch checked={item.checked} onCheckedChange={item.onChange} />
          </div>
        ))}
      </motion.div>

      {/* Danger zone */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="apple-card p-6 space-y-4 border-red-500/20">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Account</h2>
        <Button variant="outline" onClick={handleSignOut}
          className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50">
          <LogOut className="w-4 h-4" /> Sign out
        </Button>
      </motion.div>
    </div>
  );
}
