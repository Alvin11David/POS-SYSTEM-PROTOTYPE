import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

export type TourStep = {
  /** CSS selector for the element to highlight. If omitted, tooltip is centered. */
  selector?: string;
  /** Route to navigate to before showing this step. */
  route?: string;
  title: string;
  body: string;
  /** Preferred placement of the tooltip relative to the highlighted element. */
  placement?: "top" | "bottom" | "left" | "right" | "center";
  /** Padding around the highlighted element (px). */
  padding?: number;
};

const STEPS: TourStep[] = [
  {
    route: "/",
    selector: "[data-tour='dashboard-hero']",
    title: "Welcome to Jambo POS 👋",
    body: "Let's take a quick tour. We'll walk you through the most important parts of the system in under a minute.",
    placement: "bottom",
  },
  {
    route: "/",
    selector: "[data-tour='sidebar-panel']",
    title: "Main navigation",
    body: "Use the sidebar to jump between Dashboard, Sales, Products, Reports and more. Items are grouped by purpose.",
    placement: "right",
    padding: 6,
  },
  {
    route: "/",
    selector: "[data-tour='topbar-search']",
    title: "Global search",
    body: "Quickly find any product or transaction. Press ⌘K (or Ctrl+K) to focus it from anywhere.",
    placement: "bottom",
  },
  {
    route: "/",
    selector: "[data-tour='dashboard-hero']",
    title: "Your daily overview",
    body: "This card greets you with today's date. Click 'New Sale' anytime to jump straight into the POS.",
    placement: "bottom",
  },
  {
    route: "/",
    selector: "[data-tour='dashboard-stats']",
    title: "At-a-glance KPIs",
    body: "Sales, transactions, items sold and all-time revenue — refreshed in real-time as you record sales.",
    placement: "bottom",
  },
  {
    route: "/sales",
    selector: "[data-tour='sales-screen']",
    title: "The Sales screen",
    body: "This is where you'll spend most of your day. Tap products to add them to the cart on the right.",
    placement: "top",
  },
  {
    route: "/products",
    selector: "[data-tour='products-search']",
    title: "Search your catalog",
    body: "Use search to find products instantly when your catalog grows.",
    placement: "bottom",
  },
  {
    route: "/products",
    selector: "[data-tour='products-add']",
    title: "Add new products",
    body: "Create new items from here and keep your inventory ready for sales.",
    placement: "bottom",
  },
  {
    route: "/products",
    selector: "[data-tour='products-grid']",
    title: "Manage your catalog",
    body: "Edit or delete items from the product grid, and use emojis to make them easy to scan.",
    placement: "top",
  },
  {
    route: "/reports",
    selector: "[data-tour='reports-screen']",
    title: "Reports & insights",
    body: "Track revenue, top sellers and trends over time. Switch periods or export data as CSV.",
    placement: "top",
  },
  {
    route: "/guide",
    selector: "[data-tour='guide-hero']",
    title: "You're all set 🎉",
    body: "The full written guide lives here. Replay this tour anytime from the Dashboard. Happy selling!",
    placement: "bottom",
  },
];

type TourContextValue = {
  active: boolean;
  index: number;
  step: TourStep | null;
  total: number;
  start: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  goTo: (i: number) => void;
};

const TourContext = createContext<TourContextValue | null>(null);

const SEEN_KEY = "jambo-tour-seen-v1";

export function TourProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const start = useCallback(() => {
    setIndex(0);
    setActive(true);
  }, []);

  const stop = useCallback(() => {
    setActive(false);
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const next = useCallback(() => {
    setIndex((i) => {
      if (i >= STEPS.length - 1) {
        setActive(false);
        try {
          localStorage.setItem(SEEN_KEY, "1");
        } catch {
          /* ignore */
        }
        return i;
      }
      return i + 1;
    });
  }, []);

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const goTo = useCallback(
    (i: number) => setIndex(Math.max(0, Math.min(STEPS.length - 1, i))),
    [],
  );

  const step = active ? STEPS[index] : null;

  // Auto-navigate when the step requires a different route
  useEffect(() => {
    if (!active || !step?.route) return;
    if (location.pathname !== step.route) {
      navigate(step.route);
    }
  }, [active, step, location.pathname, navigate]);

  // Auto-start once for first-time visitors on the dashboard
  useEffect(() => {
    let seen = "1";
    try {
      seen = localStorage.getItem(SEEN_KEY) ?? "";
    } catch {
      /* ignore */
    }
    if (!seen && location.pathname === "/") {
      const t = setTimeout(() => {
        setIndex(0);
        setActive(true);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [location.pathname]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stop();
      else if (e.key === "ArrowRight" || e.key === "Enter") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, next, prev, stop]);

  const value = useMemo<TourContextValue>(
    () => ({
      active,
      index,
      step,
      total: STEPS.length,
      start,
      stop,
      next,
      prev,
      goTo,
    }),
    [active, index, step, start, stop, next, prev, goTo],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within TourProvider");
  return ctx;
}
