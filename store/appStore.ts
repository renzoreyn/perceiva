import { create } from "zustand";
import type { ExchangeRates, Currency } from "@/types";

interface AppState {
  rates: ExchangeRates | null;
  ratesFetchedAt: number | null;
  setRates: (rates: ExchangeRates) => void;

  // Tutorial
  tutorialActive: boolean;
  setTutorialActive: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  rates: null,
  ratesFetchedAt: null,
  setRates: (rates) => set({ rates, ratesFetchedAt: Date.now() }),

  tutorialActive: false,
  setTutorialActive: (v) => set({ tutorialActive: v }),
}));
