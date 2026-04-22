import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  // Per-image costs can be as low as ~$0.0003. Locking to 2 decimals hides
  // per-gen balance changes on typical $1–$10 wallets; widen precision when
  // the balance is small so the deduction is visible.
  const abs = Math.abs(amount);
  let fractionDigits = 2;
  if (abs < 10) fractionDigits = 4;
  if (abs < 0.01) fractionDigits = 5;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

export function formatCost(amount: number): string {
  if (amount < 0.01) {
    return `$${amount.toFixed(5)}`;
  }
  return formatCurrency(amount);
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + "…";
}
