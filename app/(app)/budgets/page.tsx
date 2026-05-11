"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Category { id: string; name: string; icon: string; color: string; type: string }
interface BudgetWithSpending {
  id: string; categoryId: string; amount: number; period: string;
  spent: number; percentage: number;
  category: { id: string; name: string; icon: string; color: string };
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

function getBudgetStatus(pct: number) {
  if (pct >= 100) return { label: "Over budget", color: "text-red-500", bg: "bg-red-500", icon: AlertCircle };
  if (pct >= 80) return { label: "Almost there", color: "text-orange-500", bg: "bg-orange-500", icon: AlertTriangle };
  return { label: "On track", color: "text-green-500", bg: "bg-green-500", icon: CheckCircle };
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetWithSpending[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [budgetRes, catRes] = await Promise.all([
      fetch("/api/budgets"),
      fetch("/api/transactions/categories"),
    ]);
    const [budgetData, catData] = await Promise.all([budgetRes.json(), catRes.json()]);
    setBudgets(Array.isArray(budgetData) ? budgetData : []);
    setCategories(Array.isArray(catData) ? catData.filter((c: Category) => c.type === "EXPENSE") : []);
    setLoading(false);
  }

  async function handleCreate() {
    if (!categoryId || !amount) return;
    setSaving(true);
    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, amount: Number(amount), period: "monthly" }),
    });
    setSaving(false);
    setShowCreate(false);
    setCategoryId(""); setAmount("");
    fetchAll();
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch("/api/budgets", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteId }),
    });
    setDeleteId(null);
    fetchAll();
  }

  const budgetCategoryIds = new Set(budgets.map(b => b.categoryId));
  const availableCategories = categories.filter(c => !budgetCategoryIds.has(c.id));

  const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overallPct = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budgets</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monthly spending limits per category</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2" disabled={availableCategories.length === 0}>
          <Plus className="w-4 h-4" /> Add Budget
        </Button>
      </div>

      {/* Overall summary */}
      {budgets.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="apple-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Monthly Overview</p>
            <p className="text-sm tabular-nums">
              <span className={overallPct >= 100 ? "text-red-500" : "text-foreground"}>
                ${totalSpent.toFixed(2)}
              </span>
              <span className="text-muted-foreground"> / ${totalBudgeted.toFixed(2)}</span>
            </p>
          </div>
          <Progress
            value={Math.min(overallPct, 100)}
            indicatorClassName={overallPct >= 100 ? "bg-red-500" : overallPct >= 80 ? "bg-orange-500" : "bg-primary"}
            className="h-2"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{overallPct.toFixed(0)}% used</span>
            <span>${Math.max(totalBudgeted - totalSpent, 0).toFixed(2)} remaining</span>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl shimmer" />)}
        </div>
      ) : budgets.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="apple-card p-16 text-center space-y-4">
          <div className="text-5xl">🎯</div>
          <h2 className="text-lg font-semibold">No budgets yet</h2>
          <p className="text-sm text-muted-foreground">Set spending limits to stay on track</p>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Budget
          </Button>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show"
          className="grid grid-cols-2 gap-4">
          {budgets.map(budget => {
            const status = getBudgetStatus(budget.percentage);
            const StatusIcon = status.icon;
            const remaining = budget.amount - budget.spent;

            return (
              <motion.div key={budget.id} variants={item}>
                <div className="apple-card p-5 space-y-4 group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: budget.category.color + "20" }}>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: budget.category.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{budget.category.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Monthly</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        className={cn("text-[10px] gap-1 border-0",
                          budget.percentage >= 100 ? "bg-red-500/15 text-red-500" :
                          budget.percentage >= 80 ? "bg-orange-500/15 text-orange-500" :
                          "bg-green-500/15 text-green-500"
                        )}
                      >
                        <StatusIcon className="w-2.5 h-2.5" />
                        {status.label}
                      </Badge>
                      <Button variant="ghost" size="icon-sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 h-6 w-6"
                        onClick={() => setDeleteId(budget.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Progress
                      value={budget.percentage}
                      indicatorClassName={status.bg}
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">${budget.spent.toFixed(2)} spent</span>
                      <span className={cn("font-medium tabular-nums", remaining < 0 ? "text-red-500" : "text-muted-foreground")}>
                        {remaining >= 0 ? `$${remaining.toFixed(2)} left` : `$${Math.abs(remaining).toFixed(2)} over`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">Budget limit</span>
                    <span className="text-sm font-semibold tabular-nums">${budget.amount.toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Create budget dialog */}
      <Dialog open={showCreate} onOpenChange={v => !v && setShowCreate(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Budget</DialogTitle>
            <DialogDescription>Set a monthly spending limit for a category.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Monthly limit (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  type="number" min="1" step="1"
                  placeholder="e.g. 300" value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="pl-7 tabular-nums"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !categoryId || !amount}>
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Create Budget"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove budget?</DialogTitle>
            <DialogDescription>This will remove the spending limit for this category.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
