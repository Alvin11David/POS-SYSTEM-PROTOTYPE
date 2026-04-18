import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface Package {
  id: string;
  name: string;
  description: string;
  amount: number;
  maxDays: number;
  pos: string;
}

export interface PosTable {
  id: string;
  number: string;
  description: string;
  pos: string;
}

export type ReservationStatus = "Open" | "Confirmed" | "Cancelled" | "Complete";

export interface Reservation {
  id: string;
  clientName: string;
  organisation?: string;
  telephone?: string;
  email?: string;
  date: string; // ISO date
  time: string; // HH:mm
  adults: number;
  children: number;
  tableNo: string;
  description?: string;
  deposit: number;
  status: ReservationStatus;
  createdAt: string;
}

const PACKAGES_KEY = "jambo_packages";
const TABLES_KEY = "jambo_tables";
const RESERVATIONS_KEY = "jambo_reservations";

const defaultPackages: Package[] = [];

const defaultTables: PosTable[] = Array.from({ length: 9 }).map((_, i) => ({
  id: `t${i + 1}`,
  number: `Table ${i + 1}`,
  description: i % 2 === 0
    ? "Main Bar, Restaurant, Health Club"
    : "Health Club, Restaurant, Main Bar",
  pos: "Main Bar",
}));

const defaultReservations: Reservation[] = [];

interface Ctx {
  packages: Package[];
  tables: PosTable[];
  reservations: Reservation[];
  addPackage: (p: Omit<Package, "id">) => void;
  updatePackage: (id: string, p: Omit<Package, "id">) => void;
  deletePackage: (id: string) => void;
  addTable: (t: Omit<PosTable, "id">) => void;
  updateTable: (id: string, t: Omit<PosTable, "id">) => void;
  deleteTable: (id: string) => void;
  addReservation: (r: Omit<Reservation, "id" | "createdAt">) => void;
  updateReservation: (id: string, r: Partial<Omit<Reservation, "id" | "createdAt">>) => void;
  deleteReservation: (id: string) => void;
}

const C = createContext<Ctx | null>(null);

function usePersisted<T>(key: string, init: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : init;
    } catch {
      return init;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

export function PosExtraProvider({ children }: { children: ReactNode }) {
  const [packages, setPackages] = usePersisted<Package[]>(PACKAGES_KEY, defaultPackages);
  const [tables, setTables] = usePersisted<PosTable[]>(TABLES_KEY, defaultTables);
  const [reservations, setReservations] = usePersisted<Reservation[]>(
    RESERVATIONS_KEY,
    defaultReservations
  );

  const value: Ctx = {
    packages,
    tables,
    reservations,
    addPackage: (p) => setPackages((prev) => [...prev, { ...p, id: crypto.randomUUID() }]),
    updatePackage: (id, p) =>
      setPackages((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x))),
    deletePackage: (id) => setPackages((prev) => prev.filter((x) => x.id !== id)),
    addTable: (t) => setTables((prev) => [...prev, { ...t, id: crypto.randomUUID() }]),
    updateTable: (id, t) =>
      setTables((prev) => prev.map((x) => (x.id === id ? { ...x, ...t } : x))),
    deleteTable: (id) => setTables((prev) => prev.filter((x) => x.id !== id)),
    addReservation: (r) =>
      setReservations((prev) => [
        { ...r, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
        ...prev,
      ]),
    updateReservation: (id, r) =>
      setReservations((prev) => prev.map((x) => (x.id === id ? { ...x, ...r } : x))),
    deleteReservation: (id) => setReservations((prev) => prev.filter((x) => x.id !== id)),
  };

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function usePosExtra() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("usePosExtra must be used within PosExtraProvider");
  return ctx;
}
