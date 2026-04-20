import { useMemo, useState } from "react";
import {
  Check,
  Filter,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePos } from "@/store/posStore";
import { useCurrency } from "@/store/currencyStore";
import { CartItem, Product, Sale } from "@/types/pos";
import { toast } from "sonner";
import { ReceiptDialog } from "@/components/ReceiptDialog";

export default function Sales() {
  const { products, recordSale } = usePos();
  const { formatCurrency, taxRate } = useCurrency();
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    name: string;
  } | null>(null);
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
      p.name.toLowerCase().includes(query.toLowerCase()),
  );

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const existing = prev.find((x) => x.id === p.id);
      if (existing)
        return prev.map((x) =>
          x.id === p.id ? { ...x, quantity: x.quantity + 1 } : x,
        );
      return [...prev, { ...p, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((x) => (x.id === id ? { ...x, quantity: x.quantity + delta } : x))
        .filter((x) => x.quantity > 0),
    );
  };

  const removeItem = (id: string) =>
    setCart((prev) => prev.filter((x) => x.id !== id));
  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((a, i) => a + i.price * i.quantity, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  const cartUnits = cart.reduce((acc, item) => acc + item.quantity, 0);

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
    <div
      className="relative mx-auto max-w-375 space-y-5"
      data-tour="sales-screen"
    >
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-slate-900 via-slate-900 to-primary/75 p-5 text-primary-foreground shadow-elevated sm:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,hsl(0_0%_100%/0.2),transparent_42%)]" />
        <div className="absolute -bottom-14 -right-6 h-36 w-36 rounded-full bg-success/20 blur-3xl" />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70">
              Point of Sale
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
              Fast Checkout Desk
            </h1>
            <p className="mt-1 text-sm text-white/80">
              Search products, build the cart, and complete a sale in seconds.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-wide text-white/70">
                In Cart
              </p>
              <p className="text-lg font-extrabold">{cartUnits} units</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-wide text-white/70">
                Estimated Total
              </p>
              <p className="text-lg font-extrabold">{formatCurrency(total)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:h-[calc(100vh-8.5rem)] lg:grid-cols-[1fr_390px]">
        <Card className="flex min-h-0 flex-col border-border/60 bg-linear-to-b from-card to-background/40 p-4 shadow-soft sm:p-5 animate-fade-in">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative min-w-50 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="h-11 border-border/70 bg-background/80 pl-9"
              />
            </div>
            <Badge className="h-11 rounded-xl border-0 bg-primary-soft px-3 text-primary hover:bg-primary-soft">
              <Package className="mr-1 h-4 w-4" /> {filtered.length} shown
            </Badge>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-base ${
                  category === c
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "border border-border/70 bg-secondary/70 text-foreground hover:bg-accent"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Available products</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              <Filter className="h-3.5 w-3.5" /> {category}
            </span>
          </div>

          <div className="flex-1 pr-1 lg:overflow-y-auto">
            {filtered.length === 0 ? (
              <Card className="p-8 text-center shadow-soft sm:p-12">
                <p className="text-sm font-semibold">No products found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try a different search or category.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {filtered.map((p) => (
                  <article
                    key={p.id}
                    className="group relative rounded-2xl border border-border/70 bg-card p-3.5 text-left shadow-sm transition-base hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated animate-scale-in"
                  >
                    <button
                      type="button"
                      onClick={() => addToCart(p)}
                      className="absolute inset-0 rounded-2xl"
                      aria-label={`Add ${p.name} to cart`}
                    />
                    <button
                      type="button"
                      className="relative mb-3 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-primary-soft text-[11px] font-semibold text-primary transition-base group-hover:bg-primary group-hover:text-primary-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (p.imageUrl) {
                          setPreviewImage({ url: p.imageUrl, name: p.name });
                        }
                      }}
                      aria-label={
                        p.imageUrl
                          ? `Preview ${p.name}`
                          : `${p.name} image unavailable`
                      }
                    >
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        p.name.slice(0, 2).toUpperCase()
                      )}
                    </button>
                    <p className="relative truncate text-sm font-semibold">
                      {p.name}
                    </p>
                    <p className="relative mt-1 text-base font-extrabold text-primary">
                      {formatCurrency(p.price)}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="flex flex-col border-border/60 bg-card/95 p-4 shadow-elevated lg:sticky lg:top-20 lg:max-h-[calc(100vh-8.5rem)] sm:p-5 animate-slide-in-right">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-semibold">Current order</h2>
                <p className="text-xs text-muted-foreground">
                  {cartUnits} units in {cart.length} lines
                </p>
              </div>
            </div>
            {cart.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-muted-foreground"
              >
                Clear
              </Button>
            )}
          </div>

          <Separator />

          <div className="-mx-1 flex-1 overflow-y-auto px-1 py-4">
            {cart.length === 0 && !success && (
              <div className="flex h-full flex-col items-center justify-center text-center py-12">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                  <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Cart is empty</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-55">
                  Tap a product to add it to the order.
                </p>
              </div>
            )}

            {cart.length === 0 && success && (
              <div className="flex h-full flex-col items-center justify-center text-center py-12 animate-scale-in">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full gradient-success shadow-glow">
                  <Check className="h-7 w-7 text-success-foreground" />
                </div>
                <p className="font-semibold">Sale completed!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  #{success.id.slice(0, 6).toUpperCase()} ·{" "}
                  {formatCurrency(success.total)}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReceiptOpen(true)}
                  >
                    View receipt
                  </Button>
                  <Button
                    size="sm"
                    className="shadow-glow"
                    onClick={() => setSuccess(null)}
                  >
                    New order
                  </Button>
                </div>
              </div>
            )}

            <ul className="space-y-2">
              {cart.map((item) => (
                <li
                  key={item.id}
                  className="animate-fade-in flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 p-2.5 transition-base hover:border-primary/30"
                >
                  <button
                    type="button"
                    className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary-soft text-[11px] font-semibold text-primary"
                    onClick={() =>
                      item.imageUrl &&
                      setPreviewImage({ url: item.imageUrl, name: item.name })
                    }
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      item.name.slice(0, 2).toUpperCase()
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQty(item.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQty(item.id, 1)}
                    >
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
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax ({(taxRate * 100).toFixed(2)}%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-1">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
              <Button
                size="lg"
                onClick={completeSale}
                className="gradient-primary w-full gap-2 rounded-xl shadow-glow transition-base hover:scale-[1.01]"
              >
                <Check className="h-4 w-4" /> Complete Sale ·{" "}
                {formatCurrency(total)}
              </Button>
            </>
          )}
        </Card>
      </div>

      <ReceiptDialog
        sale={success}
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
      />

      <Dialog
        open={!!previewImage}
        onOpenChange={(o) => !o && setPreviewImage(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{previewImage?.name ?? "Image preview"}</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="overflow-hidden rounded-xl border border-border/60 bg-secondary">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="h-auto max-h-[70vh] w-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
