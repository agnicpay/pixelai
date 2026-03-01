"use client";

import { Wallet, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BalanceDisplayProps {
  balance: number;
  onTopUp?: () => void;
}

export default function BalanceDisplay({ balance, onTopUp }: BalanceDisplayProps) {
  const clickable = !!onTopUp;

  return (
    <button
      type="button"
      onClick={clickable ? onTopUp : undefined}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-sm ${
        clickable
          ? "cursor-pointer hover:bg-white/[0.08] transition-colors"
          : "cursor-default"
      }`}
    >
      <Wallet className="w-4 h-4 text-emerald-400" />
      <span className="text-white/70">Balance:</span>
      <span className="font-medium text-emerald-400">
        {formatCurrency(balance)}
      </span>
      {clickable && (
        <Plus className="w-3.5 h-3.5 text-emerald-400" />
      )}
    </button>
  );
}
