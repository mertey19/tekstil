"use client";
import { createContext, useContext } from "react";
import type { Customer } from "@/lib/customer-model";

export async function customerRequest<T>(
  path: string,
  data?: unknown,
  method = "POST",
): Promise<T> {
  const response = await fetch(`/api/uyelik/${path}`, {
    method,
    cache: "no-store",
    headers: { "Content-Type": "application/json", "x-customer-request": "1" },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  const result = await response
    .json()
    .catch(() => ({ error: "Sunucu yanıtı alınamadı. Yeniden deneyin." }));
  if (!response.ok) throw new Error(result.error || "İşlem tamamlanamadı.");
  return result;
}
type Session = { customer: Customer | null };
const SessionContext = createContext<Session>({ customer: null });
export const useCustomer = () => useContext(SessionContext);
export function CustomerProvider({
  customer,
  children,
}: {
  customer: Customer | null;
  children: React.ReactNode;
}) {
  return (
    <SessionContext.Provider value={{ customer }}>
      {children}
    </SessionContext.Provider>
  );
}
