"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Icon } from "@/components/icon";
import type { CartLine, CartProduct, ShopConfig } from "@/lib/cart";
import { cartTotals } from "@/lib/cart";

const storageKey = "siliver-silen-cart-v1";
type CartContextValue = {
  products: CartProduct[];
  shop: ShopConfig;
  lines: CartLine[];
  count: number;
  add: (productId: string, quantity?: number) => void;
  update: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};
const CartContext = createContext<CartContextValue | null>(null);

function safeLines(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((line) => {
    if (
      !line ||
      typeof line !== "object" ||
      typeof line.productId !== "string" ||
      !Number.isInteger(line.quantity)
    )
      return [];
    return [
      {
        productId: line.productId.slice(0, 140),
        quantity: Math.max(1, Math.min(99, line.quantity)),
      },
    ];
  });
}

export function CartProvider({
  products,
  shop,
  children,
}: {
  products: CartProduct[];
  shop: ShopConfig;
  children: React.ReactNode;
}) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setLines(safeLines(JSON.parse(localStorage.getItem(storageKey) || "[]")));
      } catch {
        setLines([]);
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(storageKey, JSON.stringify(lines));
  }, [lines, ready]);
  const allowed = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const update = useCallback((productId: string, quantity: number) =>
    setLines((current) => {
      const product = allowed.get(productId);
      if (!product || !product.salesEnabled) return current;
      const maximum = product.trackStock ? product.stock : 99;
      if (quantity <= 0) return current.filter((line) => line.productId !== productId);
      const safeQuantity = Math.min(99, maximum, Math.max(1, quantity));
      if (safeQuantity < 1) return current;
      const existing = current.find((line) => line.productId === productId);
      return existing
        ? current.map((line) =>
            line.productId === productId
              ? { ...line, quantity: safeQuantity }
              : line,
          )
        : [...current, { productId, quantity: safeQuantity }];
    }), [allowed]);
  const clear = useCallback(() => {
    localStorage.setItem(storageKey, "[]");
    setLines([]);
  }, []);
  const value = useMemo<CartContextValue>(
    () => ({
      products,
      shop,
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      add: (productId, quantity = 1) => {
        const existing = lines.find((line) => line.productId === productId);
        update(productId, (existing?.quantity || 0) + quantity);
      },
      update,
      remove: (productId) =>
        setLines((current) =>
          current.filter((line) => line.productId !== productId),
        ),
      clear,
    }),
    [clear, lines, products, shop, update],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("CartProvider bulunamadı.");
  return cart;
};

export function CartShortcut() {
  const { count, shop } = useCart();
  if (!shop.enabled) return null;
  return (
    <Link className="cart-shortcut" href="/sepet" aria-label={`Sepet, ${count} ürün`}>
      <Icon name="cart" />
      {count > 0 && <span>{count > 99 ? "99+" : count}</span>}
    </Link>
  );
}

export function AddToCart({
  productId,
  disabled = false,
  compact = false,
}: {
  productId: string;
  disabled?: boolean;
  compact?: boolean;
}) {
  const { add, products, shop } = useCart();
  const [added, setAdded] = useState(false);
  const product = products.find((item) => item.id === productId);
  if (!shop.enabled || !product?.salesEnabled) return null;
  const soldOut = product.trackStock && product.stock < 1;
  return (
    <button
      type="button"
      className={compact ? "add-cart compact" : "button primary add-cart"}
      disabled={disabled || soldOut}
      onClick={() => {
        add(productId);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
    >
      <Icon name={added ? "check" : "cart"} size={18} />
      {soldOut ? "Tükendi" : added ? "Sepete eklendi" : "Sepete ekle"}
    </button>
  );
}

export function useCartTotals() {
  const { lines, products, shop } = useCart();
  return cartTotals(lines, products, shop);
}
