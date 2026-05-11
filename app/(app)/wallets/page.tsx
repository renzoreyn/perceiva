"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import WalletCard from "@/components/cards/WalletCard";
import { CURRENCIES, CARD_THEMES } from "@/types";
import type { WalletWithStats, Currency, CardThemeId } from "@/types";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1 } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

export default function WalletsPage() {
  const [wallets, setWallets] = useState<WalletWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editWallet, setEditWallet] = useState<WalletWithStats | null>(null);
  const [deleteWallet, setDeleteWallet] = useState<WalletWithStats | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [cardColor, setCardColor] = useState<CardThemeId>("card-space");
  const [emoji, setEmoji] = useState("");

  useEffect(() => { fetchWallets(); }, []);

  async function fetchWallets() {
    setLoading(true);
    const res = await fetch("/api/wallets");
    const data = await res.json();
    setWallets(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function openCreate() {
    setName(""); setCurrency("USD"); setCardColor("card-space"); setEmoji("");
    setShowCreate(true);
  }

  function openEdit(wallet: WalletWithStats) {
    setName(wallet.name);
    setCurrency(wallet.baseCurrency);
    setCardColor(wallet.cardColor as CardThemeId);
    setEmoji(wallet.emoji ?? "");
    setEditWallet(wallet);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    if (editWallet) {
      await fetch(`/api/wallets/${editWallet.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, baseCurrency: currency, cardColor, emoji: emoji || null }),
      });
      setEditWallet(null);
    } else {
      await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, baseCurrency: currency, cardColor, emoji: emoji || null }),
      });
      setShowCreate(false);
    }
    setSaving(false);
    fetchWallets();
  }

  async function handleDelete() {
    if (!deleteWallet) return;
    await fetch(`/api/wallets/${deleteWallet.id}`, { method: "DELETE" });
    setDeleteWallet(null);
    fetchWallets();
  }

  // Preview wallet for the form
  const previewWallet: WalletWithStats = {
    id: "preview",
    name: name || "My Wallet",
    baseCurrency: currency,
    cardColor,
    cardStyle: "dark",
    emoji: emoji || null,
    isDefault: false,
    totalIncomeUsd: 0,
    totalExpenseUsd: 0,
    balanceUsd: 0,
    transactionCount: 0,
  };

  const FormDialog = ({ open, onClose, title }: { open: boolean; onClose: () => void; title: string }) => (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Customize your wallet card and base currency.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 mt-2">
          {/* Form fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Wallet name</Label>
              <Input placeholder="e.g. Main Account" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Emoji (optional)</Label>
              <Input placeholder="💳" value={emoji} onChange={e => setEmoji(e.target.value)} maxLength={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Base currency</Label>
              <Select value={currency} onValueChange={v => setCurrency(v as Currency)}>
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
            </div>
            <div className="space-y-2">
              <Label>Card style</Label>
              <div className="grid grid-cols-2 gap-2">
                {CARD_THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setCardColor(theme.id as CardThemeId)}
                    className={cn(
                      "h-10 rounded-xl text-xs font-medium transition-all duration-200 border-2",
                      theme.class, theme.textClass,
                      cardColor === theme.id ? "border-primary scale-105 shadow-apple-md" : "border-transparent opacity-70 hover:opacity-100"
                    )}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Preview</p>
            <WalletCard wallet={previewWallet} size="md" />
            <p className="text-[11px] text-muted-foreground">Tap to see back</p>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (editWallet ? "Save changes" : "Create wallet")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Wallets</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your accounts and cards</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> New Wallet</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl shimmer" />
          ))}
        </div>
      ) : wallets.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="apple-card p-16 text-center space-y-4">
          <div className="text-5xl">💳</div>
          <h2 className="text-lg font-semibold">No wallets yet</h2>
          <p className="text-sm text-muted-foreground">Create your first wallet to start tracking your finances</p>
          <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> Create Wallet</Button>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show"
          className="grid grid-cols-2 gap-8">
          {wallets.map(wallet => (
            <motion.div key={wallet.id} variants={item}>
              <div className="apple-card p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{wallet.emoji} {wallet.name}</h3>
                    {wallet.isDefault && <Badge variant="muted" className="text-[10px]">Default</Badge>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(wallet)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    {!wallet.isDefault && (
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleteWallet(wallet)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex justify-center">
                  <WalletCard wallet={wallet} size="md" />
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/50">
                  {[
                    { label: "Balance", value: `$${wallet.balanceUsd.toFixed(2)}`, color: wallet.balanceUsd >= 0 ? "text-green-500" : "text-red-500" },
                    { label: "Total in", value: `$${wallet.totalIncomeUsd.toFixed(2)}`, color: "text-green-500" },
                    { label: "Total out", value: `$${wallet.totalExpenseUsd.toFixed(2)}`, color: "text-red-500" },
                  ].map(stat => (
                    <div key={stat.label} className="text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                      <p className={cn("text-sm font-semibold tabular-nums mt-0.5", stat.color)}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <FormDialog open={showCreate} onClose={() => setShowCreate(false)} title="Create wallet" />
      <FormDialog open={!!editWallet} onClose={() => setEditWallet(null)} title="Edit wallet" />

      {/* Delete confirm */}
      <Dialog open={!!deleteWallet} onOpenChange={v => !v && setDeleteWallet(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete wallet?</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{deleteWallet?.name}</strong> and all its transactions. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteWallet(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
