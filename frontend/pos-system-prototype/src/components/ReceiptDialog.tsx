import { Sale } from "@/types/pos";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer, Sparkles } from "lucide-react";

interface Props {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceiptDialog({ sale, open, onOpenChange }: Props) {
  if (!sale) return null;
  const subtotal = sale.items.reduce((a, i) => a + i.price * i.quantity, 0);
  const tax = sale.total - subtotal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm print:shadow-none print:border-0">
        <DialogHeader>
          <DialogTitle className="sr-only">Receipt #{sale.id.slice(0, 6).toUpperCase()}</DialogTitle>
        </DialogHeader>

        <div id="receipt-print" className="space-y-4">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="mt-3 text-lg font-bold">Jambo POS</h2>
            <p className="text-xs text-muted-foreground">
              {new Date(sale.createdAt).toLocaleString()}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Receipt #{sale.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          <Separator />

          <ul className="space-y-2 text-sm">
            {sale.items.map((i) => (
              <li key={i.id} className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {i.emoji} {i.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {i.quantity} × ${i.price.toFixed(2)}
                  </p>
                </div>
                <span className="font-semibold tabular-nums">
                  ${(i.quantity * i.price).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          <Separator />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span className="tabular-nums">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-1">
              <span>Total</span>
              <span className="tabular-nums">${sale.total.toFixed(2)}</span>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground pt-2">
            Thank you for your purchase! 💜
          </p>
        </div>

        <div className="flex gap-2 print:hidden">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button className="flex-1 gap-2 shadow-glow" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
