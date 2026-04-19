import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Product, Sale } from "@/types/pos";

interface PosCtx {
  products: Product[];
  sales: Sale[];
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, p: Omit<Product, "id">) => void;
  deleteProduct: (id: string) => void;
  recordSale: (sale: Sale) => void;
}

const Ctx = createContext<PosCtx | null>(null);

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
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

export function PosProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      try {
        const [productsPayload, salesPayload] = await Promise.all([
          apiJson<{ products: Product[] }>("/api/products/"),
          apiJson<{ sales: Sale[] }>("/api/sales/"),
        ]);

        if (cancelled) return;
        setProducts(productsPayload.products);
        setSales(salesPayload.sales);
      } catch {
        if (cancelled) return;
        setProducts([]);
        setSales([]);
      }
    };

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  const addProduct = (p: Omit<Product, "id">) => {
    const temp: Product = { ...p, id: crypto.randomUUID() };
    setProducts((prev) => [...prev, temp]);

    void apiJson<{ product: Product }>("/api/products/", {
      method: "POST",
      body: JSON.stringify(p),
    })
      .then((payload) => {
        setProducts((prev) =>
          prev.map((entry) => (entry.id === temp.id ? payload.product : entry)),
        );
      })
      .catch(() => {
        setProducts((prev) => prev.filter((entry) => entry.id !== temp.id));
      });
  };

  const updateProduct = (id: string, p: Omit<Product, "id">) => {
    const previous = products;
    setProducts((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...p } : entry)),
    );

    void apiJson<{ product: Product }>(`/api/products/${id}/`, {
      method: "PUT",
      body: JSON.stringify(p),
    })
      .then((payload) => {
        setProducts((prev) =>
          prev.map((entry) => (entry.id === id ? payload.product : entry)),
        );
      })
      .catch(() => {
        setProducts(previous);
      });
  };

  const deleteProduct = (id: string) => {
    const previous = products;
    setProducts((prev) => prev.filter((entry) => entry.id !== id));

    void apiJson<{ ok: boolean }>(`/api/products/${id}/`, {
      method: "DELETE",
    }).catch(() => {
      setProducts(previous);
    });
  };

  const recordSale = (sale: Sale) => {
    setSales((prev) => [sale, ...prev]);

    void apiJson<{ sale: Sale }>("/api/sales/", {
      method: "POST",
      body: JSON.stringify(sale),
    })
      .then((payload) => {
        setSales((prev) =>
          prev.map((entry) => (entry.id === sale.id ? payload.sale : entry)),
        );
      })
      .catch(() => {
        setSales((prev) => prev.filter((entry) => entry.id !== sale.id));
      });
  };

  return (
    <Ctx.Provider
      value={{
        products,
        sales,
        addProduct,
        updateProduct,
        deleteProduct,
        recordSale,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function usePos() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePos must be used inside PosProvider");
  return ctx;
}
