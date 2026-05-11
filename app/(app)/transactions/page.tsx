"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowDownLeft, ArrowUpRight, Repeat, Calendar, ChevronDown, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { CURRENCIES, formatAmount, getCurrencySymbol } from "@/types";
import type { Currency, TransactionType, RecurrenceInterval, TransactionWithRelations } from "@/types";
import { formatDate } from "@/lib/utils/index";
import { cn } from "@/lib/utils";

interface Category { id: string; name: string; icon: string; color: string; type: string }
interface Wallet { id: string; name: string; baseCurrency: string; cardColor: string }

const container = { hidden: { opacity: 0 }, show: { opacity: 1 } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form
  const [txType, setTxType] = useState<TransactionType>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [walletId, setWalletId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState<RecurrenceInterval>("MONTHLY");
  const [saving, setSaving] = useState(false);
  const [convertedUsd, setConvertedUsd] = useState<number | null>(null);
  const [converting, setConverting] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [txRes, catRes, walletRes] = await Promise.all([
      fetch("/api/transactions"),
      fetch("/api/transactions/categories"),
      fetch("/api/wallets"),
    ]);
    const [txData, catData, walletData] = await Promise.all([txRes.json(), catRes.json(), walletRes.json()]);
    setTransactions(txData.transactions ?? []);
    setCategories(catData ?? []);
    const ws = Array.isArray(walletData) ? walletData : [];
    setWallets(ws);
    if (ws.length > 0 && !walletId) setWalletId(ws.find((w: Wallet & { isDefault?: boolean }) => w.isDefault)?.id ?? ws[0].id);
    setLoading(false);
  }

  // Live USD preview
  useEffect(() => {
    if (!amount || isNaN(Number(amount))) { setConvertedUsd(null); return; }
    if (currency === "USD") { setConvertedUsd(Number(amount)); return; }
    const timer = setTimeout(async () => {
      setConverting(true);
      const res = await fetch(`/api/rates?base=USD`);
      const data = await res.json();
      const rate = data.rates?.[currency];
      if (rate) setConvertedUsd(Number(amount) / rate);
      setConverting(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [amount, currency]);

  function openForm() {
    setTxType("EXPENSE"); setAmount(""); setCurrency("USD");
    setNote(""); setDate(new Date().toISOString().slice(0, 10));
    setIsRecurring(false); setRecurrenceInterval("MONTHLY"); setCategoryId("");
    setConvertedUsd(null); setShowForm(true);
  }

  async function handleSubmit() {
    if (!amount || !walletId) return;
    setSaving(true);
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletId, categoryId: categoryId || undefined, type: txType,
        amount: Number(amount), currency, note: note || undefined,
        date, isRecurring, recurrenceInterval: isRecurring ? recurrenceInterval : undefined,
      }),
    });
    setSaving(false);
    setShowForm(false);
    fetchAll();
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/transactions/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchAll();
  }

  const filtered = transactions.filter(t => filterType === "ALL" || t.type === filterType);
  const filteredCategories = categories.filter(c => c.type === txType);

  const groupedByDate = filtered.reduce((acc, tx) => {
    const key = new Date(tx.date).toDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {} as Record<string, TransactionWithRelations[]>);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{transactions.length} total transactions</p>
        </div>
        <Button onClick={openForm} className="gap-2"><Plus className="w-4 h-4" /> Log Transaction</Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Tabs value={filterType} onValueChange={v => setFilterType(v as typeof filterType)}>
          <TabsList>
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="INCOME">Income</TabsTrigger>
            <TabsTrigger value="EXPENSE">Expense</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Transactions list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => <div key={i} className="h-16 rounded-2xl shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="apple-card p-16 text-center space-y-4">
          <div className="text-5xl">💸</div>
          <h2 className="text-lg font-semibold">No transactions yet</h2>
          <p className="text-sm text-muted-foreground">Log your first transaction to start tracking</p>
          <Button onClick={openForm} className="gap-2"><Plus className="w-4 h-4" /> Log Transaction</Button>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          {Object.entries(groupedByDate).map(([dateKey, txs]) => (
            <div key={dateKey}>
              <div className="flex items-center gap-3 mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {formatDate(new Date(dateKey), "long")}
                </p>
                <div className="flex-1 h-px bg-border/50" />
                <p className="text-xs text-muted-foreground">
                  {txs.reduce((s, t) => s + (t.type === "INCOME" ? t.amountUsd : -t.amountUsd), 0) >= 0 ? "+" : ""}
                  ${Math.abs(txs.reduce((s, t) => s + (t.type === "INCOME" ? t.amountUsd : -t.amountUsd), 0)).toFixed(2)}
                </p>
              </div>
              <div className="apple-card overflow-hidden">
                {txs.map((tx, i) => (
                  <motion.div key={tx.id} variants={item}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3.5 group hover:bg-secondary/50 transition-colors cursor-default",
                      i < txs.length - 1 && "border-b border-border/50"
                    )}
                  >
                    <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: (tx.category?.color ?? "#98989D") + "20" }}>
                      {tx.type === "INCOME"
                        ? <ArrowDownLeft className="w-4 h-4 text-green-500" />
                        : <ArrowUpRight className="w-4 h-4 text-red-500" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{tx.note ?? tx.category?.name ?? "Transaction"}</p>
                        {tx.isRecurring && (
                          <Badge variant="muted" className="text-[9px] gap-1 py-0">
                            <Repeat className="w-2.5 h-2.5" />{tx.recurrenceInterval?.toLowerCase()}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-muted-foreground">{tx.wallet.name}</p>
                        {tx.category && (
                          <>
                            <span className="text-muted-foreground/30">·</span>
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tx.category.color }} />
                              <p className="text-xs text-muted-foreground">{tx.category.name}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Amounts */}
                    <div className="text-right shrink-0">
                      <p className={cn("text-sm font-semibold tabular-nums", tx.type === "INCOME" ? "text-green-500" : "text-red-500")}>
                        {tx.type === "INCOME" ? "+" : "−"}${tx.amountUsd.toFixed(2)}
                      </p>
                      {tx.currency !== "USD" && (
                        <p className="text-[10px] text-muted-foreground tabular-nums">
                          {getCurrencySymbol(tx.currency)}{tx.amount.toLocaleString()} {tx.currency}
                        </p>
                      )}
                    </div>

                    <Button variant="ghost" size="icon-sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(tx.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Log transaction dialog */}
      <Dialog open={showForm} onOpenChange={v => !v && setShowForm(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Transaction</DialogTitle>
            <DialogDescription>Record an income or expense in any currency.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Type toggle */}
            <Tabs value={txType} onValueChange={v => { setTxType(v as TransactionType); setCategoryId(""); }}>
              <TabsList className="w-full">
                <TabsTrigger value="EXPENSE" className="flex-1 gap-2">
                  <ArrowUpRight className="w-3.5 h-3.5" /> Expense
                </TabsTrigger>
                <TabsTrigger value="INCOME" className="flex-1 gap-2">
                  <ArrowDownLeft className="w-3.5 h-3.5" /> Income
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Amount + Currency */}
            <div className="space-y-1.5">
              <Label>Amount</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-mono">
                    {getCurrencySymbol(currency)}
                  </span>
                  <Input
                    type="number" min="0" step="any"
                    placeholder="0.00" value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="pl-7 tabular-nums text-lg font-semibold"
                  />
                </div>
                <Select value={currency} onValueChange={v => setCurrency(v as Currency)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(c => (
                      <SelectItem key={c.code} value={c.code}>
                        <span className="flex items-center gap-1.5">{c.flag} {c.code}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Live USD preview */}
              <AnimatePresence>
                {convertedUsd !== null && currency !== "USD" && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-xs text-muted-foreground pl-1">
                    {converting ? "Converting..." : `≈ $${convertedUsd.toFixed(2)} USD`}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Wallet */}
            <div className="space-y-1.5">
              <Label>Wallet</Label>
              <Select value={walletId} onValueChange={setWalletId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.name} ({w.baseCurrency})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label>Category <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Note + Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Note <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input placeholder="What's this for?" value={note} onChange={e => setNote(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
            </div>

            <Separator />

            {/* Recurring */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium flex items-center gap-2"><Repeat className="w-4 h-4" /> Recurring</p>
                  <p className="text-xs text-muted-foreground">Auto-log this transaction on a schedule</p>
                </div>
                <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
              </div>
              <AnimatePresence>
                {isRecurring && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <Select value={recurrenceInterval} onValueChange={v => setRecurrenceInterval(v as RecurrenceInterval)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"] as RecurrenceInterval[]).map(r => (
                          <SelectItem key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || !amount || !walletId}
              className={txType === "INCOME" ? "bg-green-500 hover:bg-green-600" : ""}
            >
              {saving
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : `Log ${txType === "INCOME" ? "Income" : "Expense"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete transaction?</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
