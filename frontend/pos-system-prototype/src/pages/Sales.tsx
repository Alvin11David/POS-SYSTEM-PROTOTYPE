import { useMemo, useState } from "react";
import { Check, Minus, Plus, Search, ShoppingCart, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePos } from "@/store/posStore";
import { CartItem, Product, Sale } from "@/types/pos";
import { toast } from "sonner";
import { ReceiptDialog } from "@/components/ReceiptDialog";

const TAX_RATE = 0.08;

export default function Sales() {
  const { products, recordSale } = usePos();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [success, setSuccess] = useState<Sale | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category ?? "Other"));
    return ["All", ...Array.from(set)];
  }, [products]);

  const filtered = products.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      p.name.toLowerCase().includes(query.toLowerCase())
  );

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const existing = prev.find((x) => x.id === p.id);
      if (existing) return prev.map((x) => (x.id === p.id ? { ...x, quantity: x.quantity + 1 } : x));
      return [...prev, { ...p, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((x) => (x.id === id ? { ...x, quantity: x.quantity + delta } : x))
        .filter((x) => x.quantity > 0)
    );
  };

  const removeItem = (id: string) => setCart((prev) => prev.filter((x) => x.id !== id));
  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((a, i) => a + i.price * i.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const completeSale = () => {
    if (cart.length === 0) return;
    const sale: Sale = {
      id: crypto.randomUUID(),
      items: cart,
      total,
      createdAt: new Date().toISOString(),
    };
    recordSale(sale);
    setSuccess(sale);
    setCart([]);
    toast.success("Sale completed!");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px] max-w-[1500px] mx-auto h-[calc(100vh-7rem)]">
      {/* Products */}
      <div className="flex flex-col min-h-0">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." className="pl-9 h-11" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-base ${
                category === c
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-secondary text-foreground hover:bg-accent"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <Card className="p-12 text-center shadow-soft">
              <p className="text-sm font-medium">No products found</p>
              <p className="text-xs text-muted-foreground mt-1">Try a different search or category.</p>
            </Card>
          ) : (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="group text-left rounded-2xl border border-border bg-card p-4 shadow-sm transition-base hover:-translate-y-0.5 hover:shadow-elevated hover:border-primary/40 active:scale-[0.98] animate-scale-in"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-2xl mb-3 transition-base group-hover:bg-primary-soft">
                    {p.emoji ?? "📦"}
                  </div>
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  <p className="text-primary font-bold mt-1">${p.price.toFixed(2)}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart */}
      <Card className="flex flex-col p-5 shadow-elevated lg:sticky lg:top-20 lg:max-h-[calc(100vh-7rem)] animate-slide-in-right">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-semibold">Current Order</h2>
              <p className="text-xs text-muted-foreground">{cart.length} items</p>
            </div>
          </div>
          {cart.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearCart} className="text-muted-foreground">
              Clear
            </Button>
          )}
        </div>

        <Separator />

        <div className="flex-1 overflow-y-auto py-4 -mx-1 px-1">
          {cart.length === 0 && !success && (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center mb-3">
                <ShoppingCart className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Cart is empty</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
                Tap a product to add it to the order.
              </p>
            </div>
          )}

          {cart.length === 0 && success && (
            <div className="flex h-full flex-col items-center justify-center text-center py-12 animate-scale-in">
              <div className="h-16 w-16 rounded-full gradient-success flex items-center justify-center mb-4 shadow-glow">
                <Check className="h-7 w-7 text-success-foreground" />
              </div>
              <p className="font-semibold">Sale completed!</p>
              <p className="text-xs text-muted-foreground mt-1">
                #{success.id.slice(0, 6).toUpperCase()} · ${success.total.toFixed(2)}
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setReceiptOpen(true)}>
                  View receipt
                </Button>
                <Button size="sm" className="shadow-glow" onClick={() => setSuccess(null)}>
                  New order
                </Button>
              </div>
            </div>
          )}

          <ul className="space-y-2">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-border/60 p-2.5 transition-base hover:border-primary/30 animate-fade-in"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-lg">
                  {item.emoji ?? "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.id, -1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.id, 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-muted-foreground hover:text-destructive transition-base"
                  aria-label="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {cart.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2 py-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-1">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Button
              size="lg"
              onClick={completeSale}
              className="w-full gap-2 shadow-glow transition-base hover:scale-[1.02] gradient-primary"
            >
              <Check className="h-4 w-4" /> Complete Sale · ${total.toFixed(2)}
            </Button>
          </>
        )}
      </Card>

      <ReceiptDialog sale={success} open={receiptOpen} onOpenChange={setReceiptOpen} />
    </div>
  );
}
