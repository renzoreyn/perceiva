import type { TutorialStep } from "./SpotlightTutorial";

export const DASHBOARD_TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "sidebar",
    target: "aside",
    title: "Navigation",
    description: "This is your main navigation. Quickly jump between Dashboard, Wallets, Transactions, Budgets, and Settings.",
    position: "right",
  },
  {
    id: "topbar-ticker",
    target: "header",
    title: "Live Exchange Rates",
    description: "Real-time exchange rates scroll here so you always know what your money is worth — no more mental math.",
    position: "bottom",
  },
  {
    id: "kpi",
    target: ".grid.grid-cols-4",
    title: "Your Financial Snapshot",
    description: "See your net worth, monthly income, expenses, and savings rate at a glance — all converted to USD.",
    position: "bottom",
  },
  {
    id: "wallets",
    target: ".wallet-card",
    title: "Wallet Cards",
    description: "Each card represents an account. Tap to flip and see stats. You can log transactions in any currency — we handle the conversion.",
    position: "right",
  },
  {
    id: "transactions",
    target: "main .apple-card",
    title: "Recent Transactions",
    description: "Every transaction shows both the original currency amount and its USD equivalent — that's the Perceiva effect.",
    position: "top",
  },
  {
    id: "log-button",
    target: "main a[href='/transactions/new'], main a[href*='transaction']",
    title: "Log Transactions",
    description: "Hit this to log income or expenses in any of the 8 supported currencies. We'll convert everything in real-time.",
    position: "bottom",
  },
];
