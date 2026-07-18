import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CartItem = {
  id: string; // product id
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
};

type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
};

const Ctx = createContext<CartCtx | undefined>(undefined);
const KEY = "sk_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch (err) {
      console.warn(err);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const add: CartCtx["add"] = (item, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + qty } : p));
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const remove = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));
  const setQty = (id: string, qty: number) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: Math.max(1, qty) } : p)));
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.quantity * Number(i.price), 0);

  return (
    <Ctx.Provider value={{ items, add, remove, setQty, clear, count, total }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
