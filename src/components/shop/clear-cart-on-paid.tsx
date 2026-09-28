"use client";

import { useEffect } from "react";
import { useCart } from "./cart-provider";

export function ClearCartOnPaid() {
  const { clear } = useCart();
  useEffect(() => clear(), [clear]);
  return null;
}
