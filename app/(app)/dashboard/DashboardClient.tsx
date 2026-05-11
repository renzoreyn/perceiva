"use client";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Plus, Wallet, Repeat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart, Bar, XAxis, CartesianGrid,
  AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";
import WalletCard from "@/components/cards/WalletCard";
import Link from "next/link";
import { formatDate } from "@/lib/utils/index";
import { getCurrencySymbol } from "@/types";
import type { WalletWithStats, TransactionWithRelations, BudgetWithSpending } from "@/types";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

interface DashboardClientProps {
  user: { name: string | null; homeCurrency: string };
  wallets: WalletWithStats[];
  recentTransactions: TransactionWithRelations[];
  monthIncomeUsd: number;
  monthExpenseUsd: number;
  netWorthUsd: number;
  budgets: BudgetWithSpending[];
}

const incomeExpenseConfig: ChartConfig = {
  income:  { label: "Income",  color: "#30D158" },
  expense: { label: "Expense", color: "#FF453A" },
};
const netWorthConfig: ChartConfig = {
  worth: { label: "Net Worth", color: "#0A84FF" },
};

const MONTHLY_DATA = [
  { month:"Jan", income:2400, expense:1800 },{ month:"Feb", income:3100, expense:2200 },
  { month:"Mar", income:2800, expense:1900 },{ month:"Apr", income:3600, expense:2700 },
  { month:"May", income:3200, expense:2100 },{ month:"Jun", income:4100, expense:3000 },
  { month:"Jul", income:3800, expense:2600 },{ month:"Aug", income:4500, expense:3200 },
  { month:"Sep", income:4200, expense:2900 },{ month:"Oct", income:5100, expense:3600 },
  { month:"Nov", income:4800, expense:3300 },{ month:"Dec", income:5600, expense:3800 },
];
const NET_WORTH_DATA = MONTHLY_DATA.map((d,i) => ({
  month: d.month,
  worth: MONTHLY_DATA.slice(0,i+1).reduce((s,m) => s+(m.income-m.expense),0)+1200,
}));
const PIE_COLORS = ["#0A84FF","#30D158","#FF9F0A","#FF453A","#BF5AF2"];

export default function DashboardClient({
  user, wallets, recentTransactions, monthIncomeUsd, monthExpenseUsd, netWorthUsd, budgets,
}: DashboardClientProps) {
  const firstName = user.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const savingsRate = monthIncomeUsd > 0 ? ((monthIncomeUsd-monthExpenseUsd)/monthIncomeUsd)*100 : 0;

  const categorySpend = recentTransactions
    .filter(t => t.type==="EXPENSE" && t.category)
    .reduce((acc,t) => { const n=t.category!.name; acc[n]=(acc[n]||0)+t.amountUsd; return acc; }, {} as Record<string,number>);
  const categoryData = Object.entries(categorySpend)
    .map(([name,amount]) => ({ name, amount:Math.round(amount*100)/100 }))
    .sort((a,b)=>b.amount-a.amount).slice(0,5);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl">
      <motion.div variants={item} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{greeting}, {firstName}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/transactions"><Button size="sm" className="gap-2"><Plus className="w-4 h-4"/>Log Transaction</Button></Link>
          <Link href="/wallets"><Button size="sm" variant="outline" className="gap-2"><Wallet className="w-4 h-4"/>New Wallet</Button></Link>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-4 gap-4">
        {[
          { label:"Net Worth", value:"$"+netWorthUsd.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}), sub:"All wallets combined", color:"text-foreground" },
          { label:"Income This Month", value:"$"+monthIncomeUsd.toFixed(2), sub:"Total in", color:"text-green-500" },
          { label:"Expenses This Month", value:"$"+monthExpenseUsd.toFixed(2), sub:"Total out", color:"text-red-500" },
          { label:"Savings Rate", value:savingsRate.toFixed(1)+"%", sub:savingsRate>=20?"Great job":"Room to improve", color:savingsRate>=20?"text-green-500":savingsRate>=0?"text-orange-500":"text-red-500" },
        ].map((kpi,i) => (
          <Card key={i} className="p-4">
            <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
            <p className={"text-xl font-bold tabular-nums mt-1 "+kpi.color}>{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        <motion.div variants={item} className="col-span-2">
          <Card className="p-5">
            <CardTitle className="text-sm font-semibold mb-1">Income vs Expenses</CardTitle>
            <CardDescription className="text-xs mb-4">Monthly breakdown in USD</CardDescription>
            <ChartContainer config={incomeExpenseConfig} className="h-[200px] w-full aspect-auto">
              <BarChart data={MONTHLY_DATA} margin={{top:4,right:4,left:-16,bottom:0}}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5}/>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{fontSize:11}}/>
                <ChartTooltip content={<ChartTooltipContent/>}/>
                <Bar dataKey="income" fill="var(--color-income)" radius={[4,4,0,0]} maxBarSize={18}/>
                <Bar dataKey="expense" fill="var(--color-expense)" radius={[4,4,0,0]} maxBarSize={18}/>
              </BarChart>
            </ChartContainer>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-5">
            <CardTitle className="text-sm font-semibold mb-1">Net Worth</CardTitle>
            <p className="text-2xl font-bold tabular-nums mb-3">
              {"$"+netWorthUsd.toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0})}
            </p>
            <ChartContainer config={netWorthConfig} className="h-[140px] w-full aspect-auto">
              <AreaChart data={NET_WORTH_DATA} margin={{top:4,right:4,left:-32,bottom:0}}>
                <defs>
                  <linearGradient id="worthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0A84FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.4}/>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{fontSize:10}}/>
                <ChartTooltip content={<ChartTooltipContent/>}/>
                <Area type="monotone" dataKey="worth" stroke="#0A84FF" strokeWidth={2} fill="url(#worthGrad)" dot={false}/>
              </AreaChart>
            </ChartContainer>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <motion.div variants={item} className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Wallets</h2>
            <Link href="/wallets"><Button variant="ghost" size="sm" className="text-xs">See all</Button></Link>
          </div>
          {wallets.length === 0 ? (
            <Card className="p-8 text-center">
              <Wallet className="w-8 h-8 text-muted-foreground mx-auto mb-3"/>
              <p className="text-sm font-medium">No wallets yet</p>
              <Link href="/wallets"><Button size="sm" className="mt-4 gap-2"><Plus className="w-4 h-4"/>Create Wallet</Button></Link>
            </Card>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
              {wallets.slice(0,4).map((wallet,i) => (
                <motion.div key={wallet.id} initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} transition={{delay:i*0.08}} className="snap-start shrink-0">
                  <Link href={"/wallets/"+wallet.id}><WalletCard wallet={wallet} size="md"/></Link>
                </motion.div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Transactions</h2>
            <Link href="/transactions"><Button variant="ghost" size="sm" className="text-xs">See all</Button></Link>
          </div>
          <Card>
            {recentTransactions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No transactions this month</p>
                <Link href="/transactions"><Button size="sm" className="mt-3 gap-2"><Plus className="w-4 h-4"/>Log first</Button></Link>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {recentTransactions.map((tx,i) => (
                  <motion.div key={tx.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.04}}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{backgroundColor:(tx.category?.color??"#98989D")+"20"}}>
                      {tx.type==="INCOME"
                        ?<ArrowDownLeft className="w-4 h-4 text-green-500"/>
                        :<ArrowUpRight className="w-4 h-4 text-red-500"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.note??tx.category?.name??"Transaction"}</p>
                      <p className="text-xs text-muted-foreground">{tx.wallet.name} · {formatDate(tx.date,"relative")}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={"text-sm font-semibold tabular-nums "+(tx.type==="INCOME"?"text-green-500":"text-red-500")}>
                        {tx.type==="INCOME"?"+":"-"}${Math.abs(tx.amountUsd).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {getCurrencySymbol(tx.currency)}{tx.amount.toLocaleString()} {tx.currency}
                      </p>
                    </div>
                    <Badge variant={tx.type==="INCOME"?"income":"expense"} className="shrink-0 text-[10px]">
                      {tx.isRecurring&&<Repeat className="w-2.5 h-2.5 mr-1"/>}{tx.type==="INCOME"?"In":"Out"}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div variants={item} className="space-y-4">
          <h2 className="text-base font-semibold">Spending by Category</h2>
          <Card className="p-4">
            {categoryData.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No expense data yet</p>
            ) : (
              <>
                <ChartContainer config={{amount:{label:"Amount",color:"#0A84FF"}}} className="h-[130px] w-full aspect-auto">
                  <PieChart>
                    <Pie data={categoryData} dataKey="amount" nameKey="name" cx="50%" cy="50%" innerRadius={36} outerRadius={56} paddingAngle={3}>
                      {categoryData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent/>}/>
                  </PieChart>
                </ChartContainer>
                <div className="space-y-1.5 mt-2">
                  {categoryData.map((c,i) => (
                    <div key={c.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor:PIE_COLORS[i%PIE_COLORS.length]}}/>
                        <span className="text-muted-foreground">{c.name}</span>
                      </div>
                      <span className="font-medium tabular-nums">${c.amount.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Budgets</h2>
            <Link href="/budgets"><Button variant="ghost" size="sm" className="text-xs">Manage</Button></Link>
          </div>
          <Card>
            {budgets.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs text-muted-foreground">No budgets set</p>
                <Link href="/budgets"><Button size="sm" variant="outline" className="mt-2 gap-1 text-xs"><Plus className="w-3 h-3"/>Add budget</Button></Link>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {budgets.map(budget => {
                  const pct=budget.percentage;
                  const color=pct>=90?"bg-red-500":pct>=70?"bg-orange-500":"bg-green-500";
                  return (
                    <div key={budget.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor:budget.category?.color??"#98989D"}}/>
                          <span className="text-xs font-medium">{budget.category?.name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground tabular-nums">${budget.spent.toFixed(0)} / ${budget.amount.toFixed(0)}</span>
                      </div>
                      <Progress value={pct} indicatorClassName={color} className="h-1.5"/>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
