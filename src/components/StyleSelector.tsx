"use client";

import { STYLES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StyleSelectorProps {
  selectedStyle: string;
  onSelect: (styleId: string) => void;
}

export default function StyleSelector({
  selectedStyle,
  onSelect,
}: StyleSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white/60">Style</label>
      <div className="flex flex-wrap gap-2">
        {STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelect(style.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm transition-all duration-200",
              selectedStyle === style.id
                ? "gradient-button text-white shadow-lg shadow-purple-500/20"
                : "glass glass-hover text-white/60",
            )}
          >
            {style.label}
          </button>
        ))}
      </div>
    </div>
  );
}
