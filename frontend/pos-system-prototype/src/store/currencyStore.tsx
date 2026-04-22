import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "@/store/authStore";
import { queueRequestIfOffline } from "@/lib/requestQueue";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "KES" | "UGX";

export const CURRENCY_OPTIONS: Array<{ code: CurrencyCode; label: string }> = [
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "KES", label: "Kenyan Shilling" },
  { code: "UGX", label: "Ugandan Shilling" },
];

const CURRENCY_KEY = "jambo_currency";
const TAX_RATE_KEY = "jambo_tax_rate";

interface CurrencyCtx {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  taxRate: number;
  setTaxRate: (rate: number) => void;
  formatCurrency: (value: number) => string;
  currencyOptions: typeof CURRENCY_OPTIONS;
}

const Ctx = createContext<CurrencyCtx | null>(null);

const API_BASE = import.meta.env.VITE_API_URL || "";
async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  // Queue request if offline (for non-GET requests)
  const isOffline = await queueRequestIfOffline(url, init || {}, API_BASE);

  if (isOffline) {
    // Return empty result for offline requests
    return {} as T;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    const stored = localStorage.getItem(CURRENCY_KEY) as CurrencyCode | null;
    if (stored && CURRENCY_OPTIONS.some((opt) => opt.code === stored)) {
      return stored;
    }
    return "USD";
  });
  const [taxRate, setTaxRate] = useState<number>(() => {
    const stored = localStorage.getItem(TAX_RATE_KEY);
    const parsed = stored ? Number(stored) : NaN;
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
    return 0.08;
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await apiJson<{
          settings: { currency: CurrencyCode; taxRate: number };
        }>("/api/settings/");
        if (
          CURRENCY_OPTIONS.some((opt) => opt.code === data.settings.currency)
        ) {
          setCurrency(data.settings.currency);
          localStorage.setItem(CURRENCY_KEY, data.settings.currency);
        }
        if (
          Number.isFinite(data.settings.taxRate) &&
          data.settings.taxRate >= 0
        ) {
          setTaxRate(data.settings.taxRate);
          localStorage.setItem(TAX_RATE_KEY, String(data.settings.taxRate));
        }
      } catch {
        // Keep local settings when backend settings are unavailable.
      }
    };

    void loadSettings();
  }, [currentUser?.id]);

  const persistSettings = (nextCurrency: CurrencyCode, nextTaxRate: number) => {
    void apiJson<{ settings: { currency: CurrencyCode; taxRate: number } }>(
      "/api/settings/",
      {
        method: "PUT",
        body: JSON.stringify({
          currency: nextCurrency,
          taxRate: nextTaxRate,
        }),
      },
    ).catch(() => {
      // Local state remains as fallback if backend update is not allowed/unavailable.
    });
  };

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
        persistSettings(next, taxRate);
      },
      taxRate,
      setTaxRate: (next) => {
        const safe = Number.isFinite(next) && next >= 0 ? next : 0;
        setTaxRate(safe);
        localStorage.setItem(TAX_RATE_KEY, String(safe));
        persistSettings(currency, safe);
      },
      formatCurrency,
      currencyOptions: CURRENCY_OPTIONS,
    };
  }, [currency, taxRate]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCurrency() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}
