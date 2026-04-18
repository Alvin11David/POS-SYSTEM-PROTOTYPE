import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Product, Sale } from "@/types/pos";

const PRODUCTS_KEY = "jambo_products";
const SALES_KEY = "jambo_sales";

const defaultProducts: Product[] = [
  { id: "p1", name: "Espresso", price: 2.5, category: "Drinks", emoji: "☕" },
  { id: "p2", name: "Cappuccino", price: 3.75, category: "Drinks", emoji: "🥛" },
  { id: "p3", name: "Croissant", price: 2.95, category: "Bakery", emoji: "🥐" },
  { id: "p4", name: "Blueberry Muffin", price: 3.25, category: "Bakery", emoji: "🧁" },
  { id: "p5", name: "Avocado Toast", price: 8.5, category: "Food", emoji: "🥑" },
  { id: "p6", name: "Caesar Salad", price: 11.0, category: "Food", emoji: "🥗" },
  { id: "p7", name: "Orange Juice", price: 4.25, category: "Drinks", emoji: "🍊" },
  { id: "p8", name: "Chocolate Cake", price: 5.5, category: "Bakery", emoji: "🍰" },
];

interface PosCtx {
  products: Product[];
  sales: Sale[];
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, p: Omit<Product, "id">) => void;
  deleteProduct: (id: string) => void;
  recordSale: (sale: Sale) => void;
}

const Ctx = createContext<PosCtx | null>(null);

export function PosProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const raw = localStorage.getItem(PRODUCTS_KEY);
      return raw ? JSON.parse(raw) : defaultProducts;
    } catch {
      return defaultProducts;
    }
  });
  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const raw = localStorage.getItem(SALES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  }, [sales]);

  const addProduct = (p: Omit<Product, "id">) =>
    setProducts((prev) => [...prev, { ...p, id: crypto.randomUUID() }]);
  const updateProduct = (id: string, p: Omit<Product, "id">) =>
    setProducts((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const deleteProduct = (id: string) =>
    setProducts((prev) => prev.filter((x) => x.id !== id));
  const recordSale = (sale: Sale) => setSales((prev) => [sale, ...prev]);

  return (
    <Ctx.Provider value={{ products, sales, addProduct, updateProduct, deleteProduct, recordSale }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePos() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePos must be used inside PosProvider");
  return ctx;
}
