export interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
  emoji?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  createdAt: string;
}
