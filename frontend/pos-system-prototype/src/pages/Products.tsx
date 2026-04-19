import { useState } from "react";
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  Package as PackageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { usePos } from "@/store/posStore";
import { useCurrency } from "@/store/currencyStore";
import { Product } from "@/types/pos";
import { toast } from "sonner";

const MAX_IMAGE_SIZE = 1_500_000;

const formatPriceInput = (value: string) => {
  const cleaned = value.replace(/,/g, "").replace(/[^\d.]/g, "");
  if (!cleaned) return "";

  const [integerPart, ...decimalParts] = cleaned.split(".");
  const integer = integerPart.replace(/^0+(\d)/, "$1") || "0";
  const decimal = decimalParts.join("").slice(0, 2);

  const formattedInteger = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Number(integer));

  if (cleaned.includes(".")) {
    return `${formattedInteger}.${decimal}`;
  }

  return formattedInteger;
};

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = usePos();
  const { formatCurrency, currency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  );

  const openNew = () => {
    setEditing(null);
    setName("");
    setPrice("");
    setImageUrl("");
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setName(p.name);
    setPrice(formatPriceInput(String(p.price)));
    setImageUrl(p.imageUrl ?? "");
    setOpen(true);
  };

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image must be 1.5MB or smaller");
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setImageUrl(dataUrl);
    } catch {
      toast.error("Could not read image");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price.replace(/,/g, ""));
    if (!name.trim() || isNaN(priceNum) || priceNum < 0) {
      toast.error("Please enter a valid name and price.");
      return;
    }
    if (editing) {
      updateProduct(editing.id, {
        name: name.trim(),
        price: priceNum,
        imageUrl,
      });
      toast.success("Product updated");
    } else {
      addProduct({ name: name.trim(), price: priceNum, imageUrl });
      toast.success("Product added");
    }
    setOpen(false);
  };

  const handleDelete = (p: Product) => {
    deleteProduct(p.id);
    toast.success(`${p.name} deleted`);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Products
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your inventory and pricing.
          </p>
        </div>
        <Button
          onClick={openNew}
          className="gap-2 shadow-glow transition-base hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <Card className="p-4 shadow-soft">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="pl-9"
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center shadow-soft">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <PackageIcon className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-semibold">No products yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add your first product to get started.
          </p>
          <Button onClick={openNew} className="mt-5 gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <Card
              key={p.id}
              className="group p-5 shadow-soft transition-base hover:shadow-elevated hover:-translate-y-0.5 animate-scale-in"
            >
              <div className="flex items-start justify-between">
                <button
                  type="button"
                  className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-secondary"
                  onClick={() =>
                    p.imageUrl &&
                    setPreviewImage({
                      url: p.imageUrl,
                      name: p.name,
                    })
                  }
                >
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PackageIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </button>
                <Badge variant="secondary" className="rounded-full text-xs">
                  {p.category ?? "General"}
                </Badge>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold truncate">{p.name}</h3>
                <p className="text-lg font-bold text-primary mt-1">
                  {formatCurrency(p.price)}
                </p>
              </div>
              <div className="mt-4 flex gap-2 transition-base sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => openEdit(p)}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setConfirmDelete(p)}
                  aria-label={`Delete ${p.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit product" : "Add product"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the product details."
                : "Add a new product to your inventory."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image">Product image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={onImageChange}
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-secondary"
                  onClick={() =>
                    imageUrl &&
                    setPreviewImage({
                      url: imageUrl,
                      name: name || "Product preview",
                    })
                  }
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PackageIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </button>
                {imageUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setImageUrl("")}
                  >
                    Remove image
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Product name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Espresso"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ({currency})</Label>
              <Input
                id="price"
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(formatPriceInput(e.target.value))}
                placeholder="0.00"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="shadow-glow">
                {editing ? "Save changes" : "Add product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              <b>{confirmDelete?.name}</b> will be removed from your catalog.
              This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
