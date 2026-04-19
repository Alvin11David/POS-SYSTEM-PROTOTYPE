import { createContext, useContext, useMemo, useState, ReactNode } from "react";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "KES" | "UGX";

export const CURRENCY_OPTIONS: Array<{ code: CurrencyCode; label: string }> = [
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "KES", label: "Kenyan Shilling" },
  { code: "UGX", label: "Ugandan Shilling" },
];

const CURRENCY_KEY = "jambo_currency";

interface CurrencyCtx {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatCurrency: (value: number) => string;
  currencyOptions: typeof CURRENCY_OPTIONS;
}

const Ctx = createContext<CurrencyCtx | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    const stored = localStorage.getItem(CURRENCY_KEY) as CurrencyCode | null;
    if (stored && CURRENCY_OPTIONS.some((opt) => opt.code === stored)) {
      return stored;
    }
    return "USD";
  });

  const value = useMemo<CurrencyCtx>(() => {
    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);

    return {
      currency,
      setCurrency: (next) => {
        setCurrency(next);
        localStorage.setItem(CURRENCY_KEY, next);
      },
      formatCurrency,
      currencyOptions: CURRENCY_OPTIONS,
    };
  }, [currency]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCurrency() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}
