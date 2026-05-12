"use client";
import { motion } from "framer-motion";
import {
  ArrowUpRight, ArrowDownLeft, Plus, Wallet, Repeat,
  TrendingUp, TrendingDown, DollarSign, Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart, Bar, XAxis, CartesianGrid,
  AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";
import Link from "next/link";
import type { WalletWithStats, TransactionWithRelations, BudgetWithSpending } from "@/types";
import { getCurrencySymbol } from "@/types";

// ── Animation variants ────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.055, delayChildren: 0.05 } },
};
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16,1,0.3,1] } } };

// ── Chart config ──────────────────────────────────────────────────────────────
const incomeExpenseConfig: ChartConfig = {
  income:  { label: "Income",   color: "#30D158" },
  expense: { label: "Expense",  color: "#FF453A" },
};
const netWorthConfig: ChartConfig = {
  worth: { label: "Net Worth", color: "#0A84FF" },
};

// ── Mock monthly data ─────────────────────────────────────────────────────────
const MONTHLY = [
  { month:"Jan",income:2400,expense:1800 },{ month:"Feb",income:3100,expense:2200 },
  { month:"Mar",income:2800,expense:1900 },{ month:"Apr",income:3600,expense:2700 },
  { month:"May",income:3200,expense:2100 },{ month:"Jun",income:4100,expense:3000 },
  { month:"Jul",income:3800,expense:2600 },{ month:"Aug",income:4500,expense:3200 },
  { month:"Sep",income:4200,expense:2900 },{ month:"Oct",income:5100,expense:3600 },
  { month:"Nov",income:4800,expense:3300 },{ month:"Dec",income:5600,expense:3800 },
];
const NET_WORTH = MONTHLY.map((d,i)=>({
  month:d.month,
  worth:MONTHLY.slice(0,i+1).reduce((s,m)=>s+(m.income-m.expense),0)+1200,
}));
const PIE_COLORS = ["#0A84FF","#30D158","#FF9F0A","#FF453A","#BF5AF2","#64D2FF"];

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  user: { name: string | null; homeCurrency: string };
  wallets: WalletWithStats[];
  recentTransactions: TransactionWithRelations[];
  monthIncomeUsd: number;
  monthExpenseUsd: number;
  netWorthUsd: number;
  budgets: BudgetWithSpending[];
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtShort(n: number) {
  if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "k";
  return "$" + n.toFixed(0);
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, trend, icon: Icon, color }: {
  label: string; value: string; sub: string;
  trend?: "up"|"down"|"neutral"; icon?: React.ComponentType<{size?:number;style?:React.CSSProperties}>;
  color?: string;
}) {
  const trendColor = trend==="up" ? "#30D158" : trend==="down" ? "#FF453A" : "inherit";
  return (
    <motion.div variants={item}>
      <Card className="p-5 h-full flex flex-col gap-3 apple-card border-0">
        <div className="flex items-start justify-between">
          <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">{label}</span>
          {Icon && (
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: color ? color+"18" : "hsl(var(--muted))" }}>
              <Icon size={15} style={{ color: color || "hsl(var(--muted-foreground))" }}/>
            </div>
          )}
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums tracking-tight" style={{ color: color || "hsl(var(--foreground))" }}>
            {value}
          </p>
          <p className="text-xs mt-0.5" style={{ color: trendColor !== "inherit" ? trendColor : "hsl(var(--muted-foreground))" }}>
            {sub}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DashboardClient({
  user, wallets, recentTransactions,
  monthIncomeUsd, monthExpenseUsd, netWorthUsd, budgets,
}: Props) {
  const firstName = user.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const savingsRate = monthIncomeUsd > 0
    ? Math.round(((monthIncomeUsd - monthExpenseUsd) / monthIncomeUsd) * 100)
    : 0;

  // category breakdown from real transactions
  const catMap = recentTransactions
    .filter(t => t.type === "EXPENSE" && t.category)
    .reduce((acc, t) => {
      const n = t.category!.name;
      acc[n] = (acc[n] || 0) + t.amountUsd;
      return acc;
    }, {} as Record<string,number>);
  const catData = Object.entries(catMap)
    .map(([name,amount]) => ({ name, amount:Math.round(amount*100)/100 }))
    .sort((a,b) => b.amount - a.amount).slice(0,5);

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="space-y-6 max-w-7xl pb-8">

      {/* ── Header ── */}
      <motion.div variants={item} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{greeting}, {firstName}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href="/transactions">
            <Button size="sm" className="gap-1.5 rounded-xl h-8 text-xs font-medium">
              <Plus className="w-3.5 h-3.5"/> Log transaction
            </Button>
          </Link>
          <Link href="/wallets">
            <Button size="sm" variant="outline" className="gap-1.5 rounded-xl h-8 text-xs font-medium">
              <Wallet className="w-3.5 h-3.5"/> New wallet
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Net Worth"         value={"$"+fmt(netWorthUsd)}   sub="All wallets"           icon={DollarSign}   color="#0A84FF"/>
        <KpiCard label="Income this month" value={"$"+fmt(monthIncomeUsd)} sub="Total in"             icon={TrendingUp}   color="#30D158" trend="up"/>
        <KpiCard label="Expenses"          value={"$"+fmt(monthExpenseUsd)} sub="Total out"           icon={TrendingDown} color="#FF453A" trend="down"/>
        <KpiCard label="Savings rate"      value={savingsRate+"%"}          sub={savingsRate>=20?"On track":"Room to improve"} icon={Activity} color={savingsRate>=20?"#30D158":savingsRate>=0?"#FF9F0A":"#FF453A"}/>
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Income vs Expense */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="apple-card border-0 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <CardTitle className="text-sm font-semibold tracking-tight">Income vs Expenses</CardTitle>
                <CardDescription className="text-xs mt-0.5">Monthly in USD · current year</CardDescription>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#30D158] inline-block"/>Income</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#FF453A] inline-block"/>Expenses</span>
              </div>
            </div>
            <ChartContainer config={incomeExpenseConfig} className="h-[180px] w-full aspect-auto">
              <BarChart data={MONTHLY} margin={{top:4,right:0,left:-20,bottom:0}} barGap={3}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5}/>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{fontSize:10,fill:"hsl(var(--muted-foreground))"}}/>
                <ChartTooltip content={<ChartTooltipContent/>} cursor={{fill:"hsl(var(--muted)/0.4)"}}/>
                <Bar dataKey="income"  fill="var(--color-income)"  radius={[4,4,0,0]} maxBarSize={14}/>
                <Bar dataKey="expense" fill="var(--color-expense)" radius={[4,4,0,0]} maxBarSize={14}/>
              </BarChart>
            </ChartContainer>
          </Card>
        </motion.div>

        {/* Net Worth */}
        <motion.div variants={item}>
          <Card className="apple-card border-0 p-5 h-full flex flex-col">
            <CardTitle className="text-sm font-semibold tracking-tight mb-0.5">Net Worth</CardTitle>
            <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground mb-3">
              {"$"+fmt(netWorthUsd)}
            </p>
            <ChartContainer config={netWorthConfig} className="h-[120px] w-full aspect-auto flex-1">
              <AreaChart data={NET_WORTH} margin={{top:4,right:0,left:-32,bottom:0}}>
                <defs>
                  <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0A84FF" stopOpacity={0.18}/>
                    <stop offset="95%" stopColor="#0A84FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.4}/>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{fontSize:9,fill:"hsl(var(--muted-foreground))"}}/>
                <ChartTooltip content={<ChartTooltipContent/>}/>
                <Area type="monotone" dataKey="worth" stroke="#0A84FF" strokeWidth={2} fill="url(#wGrad)" dot={false}/>
              </AreaChart>
            </ChartContainer>
          </Card>
        </motion.div>
      </div>

      {/* ── Main content + sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left — wallets + transactions */}
        <div className="lg:col-span-2 space-y-4">

          {/* Wallets */}
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold tracking-tight">Wallets</h2>
              <Link href="/wallets">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs rounded-lg">See all</Button>
              </Link>
            </div>
            {wallets.length === 0 ? (
              <Card className="apple-card border-0 p-8 text-center">
                <Wallet className="w-8 h-8 text-muted-foreground mx-auto mb-3"/>
                <p className="text-sm font-medium mb-1">No wallets yet</p>
                <p className="text-xs text-muted-foreground mb-4">Create your first wallet to start tracking</p>
                <Link href="/wallets">
                  <Button size="sm" className="gap-1.5 rounded-xl"><Plus className="w-3.5 h-3.5"/>Create wallet</Button>
                </Link>
              </Card>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-1 snap-x scrollbar-none">
                {wallets.slice(0,4).map((wallet,i) => (
                  <motion.div key={wallet.id}
                    initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} transition={{delay:i*0.07,duration:0.4,ease:[0.16,1,0.3,1]}}
                    className="snap-start shrink-0">
                    <Link href={"/wallets/"+wallet.id}>
                      <div className="w-[200px] rounded-2xl p-4 relative overflow-hidden cursor-pointer"
                        style={{
                          background: wallet.cardColor || "linear-gradient(135deg,#1C1C1E,#2C2C2E)",
                          boxShadow:"0 8px 24px rgba(0,0,0,0.2)",
                          aspectRatio:"1.6/1",
                        }}>
                        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(255,255,255,0.15) 0%,rgba(255,255,255,0.03) 50%,rgba(0,0,0,0.05) 100%)",pointerEvents:"none"}}/>
                        <p className="text-[10px] font-semibold tracking-widest uppercase opacity-60 text-white mb-auto">{wallet.name}</p>
                        <div className="mt-8">
                          <p className="text-[10px] opacity-50 text-white tracking-wide">BALANCE</p>
                          <p className="text-lg font-bold text-white tabular-nums tracking-tight">
                            ${(wallet.balanceUsd||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Transactions */}
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold tracking-tight">Recent Transactions</h2>
              <Link href="/transactions">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs rounded-lg">See all</Button>
              </Link>
            </div>
            <Card className="apple-card border-0 overflow-hidden">
              {recentTransactions.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-muted-foreground mb-3">No transactions this month</p>
                  <Link href="/transactions">
                    <Button size="sm" className="gap-1.5 rounded-xl"><Plus className="w-3.5 h-3.5"/>Log first</Button>
                  </Link>
                </div>
              ) : (
                <div>
                  {recentTransactions.map((tx,i) => (
                    <motion.div key={tx.id}
                      initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.04}}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
                      style={{borderBottom:i<recentTransactions.length-1?"1px solid hsl(var(--border)/0.5)":"none"}}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{background:(tx.category?.color||"#98989D")+"18"}}>
                        {tx.type==="INCOME"
                          ? <ArrowDownLeft className="w-4 h-4" style={{color:"#30D158"}}/>
                          : <ArrowUpRight  className="w-4 h-4" style={{color:"#FF453A"}}/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{tx.note||tx.category?.name||"Transaction"}</p>
                        <p className="text-xs text-muted-foreground truncate">{tx.wallet.name} · {new Date(tx.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold tabular-nums" style={{color:tx.type==="INCOME"?"#30D158":"#FF453A"}}>
                          {tx.type==="INCOME"?"+":"-"}${Math.abs(tx.amountUsd).toFixed(2)}
                        </p>
                        <p className="text-[10px] text-muted-foreground tabular-nums">
                          {getCurrencySymbol(tx.currency)}{tx.amount.toLocaleString()} {tx.currency}
                        </p>
                      </div>
                      {tx.isRecurring && (
                        <div className="shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                          <Repeat className="w-2.5 h-2.5 text-muted-foreground"/>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">

          {/* Spending by category */}
          <motion.div variants={item}>
            <h2 className="text-sm font-semibold tracking-tight mb-3">Spending by Category</h2>
            <Card className="apple-card border-0 p-4">
              {catData.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No expenses yet</p>
              ) : (
                <>
                  <ChartContainer config={{amount:{label:"Amount",color:"#0A84FF"}}} className="h-[120px] w-full aspect-auto mb-3">
                    <PieChart>
                      <Pie data={catData} dataKey="amount" nameKey="name" cx="50%" cy="50%" innerRadius={32} outerRadius={52} paddingAngle={3}>
                        {catData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent/>}/>
                    </PieChart>
                  </ChartContainer>
                  <div className="space-y-1.5">
                    {catData.map((c,i) => (
                      <div key={c.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{background:PIE_COLORS[i%PIE_COLORS.length]}}/>
                          <span className="text-muted-foreground truncate max-w-[100px]">{c.name}</span>
                        </div>
                        <span className="font-medium tabular-nums">${c.amount.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </motion.div>

          {/* Budgets */}
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold tracking-tight">Budgets</h2>
              <Link href="/budgets">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs rounded-lg">Manage</Button>
              </Link>
            </div>
            <Card className="apple-card border-0 overflow-hidden">
              {budgets.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-2">No budgets set</p>
                  <Link href="/budgets">
                    <Button size="sm" variant="outline" className="gap-1 text-xs rounded-xl"><Plus className="w-3 h-3"/>Add budget</Button>
                  </Link>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {budgets.map(budget => {
                    const pct = Math.min(budget.percentage, 100);
                    const barColor = pct >= 90 ? "#FF453A" : pct >= 70 ? "#FF9F0A" : "#30D158";
                    return (
                      <div key={budget.id} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{background:budget.category?.color||"#98989D"}}/>
                            <span className="text-xs font-medium truncate max-w-[100px]">{budget.category?.name}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground tabular-nums">
                            ${budget.spent.toFixed(0)} / ${budget.amount.toFixed(0)}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden bg-muted">
                          <motion.div
                            initial={{width:0}} animate={{width:pct+"%"}}
                            transition={{duration:0.7,ease:[0.16,1,0.3,1]}}
                            style={{height:"100%",background:barColor,borderRadius:9999}}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Live rates */}
          <motion.div variants={item}>
            <h2 className="text-sm font-semibold tracking-tight mb-3">Live Rates</h2>
            <Card className="apple-card border-0 divide-y divide-border/50">
              {[
                {pair:"GBP → USD",rate:"1.27"},
                {pair:"EUR → USD",rate:"1.09"},
                {pair:"USD → IDR",rate:"17,417"},
                {pair:"USD → PHP",rate:"58.4"},
                {pair:"USD → SGD",rate:"1.35"},
              ].map(r => (
                <div key={r.pair} className="flex items-center justify-between px-4 py-2.5 text-xs">
                  <span className="text-muted-foreground font-mono">{r.pair}</span>
                  <span className="font-semibold tabular-nums">{r.rate}</span>
                </div>
              ))}
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
