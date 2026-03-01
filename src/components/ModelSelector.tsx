"use client";

import { MODELS } from "@/lib/constants";
import { formatCost } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

interface ModelSelectorProps {
  selectedModel: string;
  onSelect: (modelId: string) => void;
}

export default function ModelSelector({
  selectedModel,
  onSelect,
}: ModelSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white/60">Model</label>
      <select
        value={selectedModel}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full rounded-xl glass px-4 py-2.5 text-white text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='rgba(255,255,255,0.4)' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
        }}
      >
        {MODELS.map((model) => (
          <option
            key={model.id}
            value={model.id}
            className="bg-surface text-white"
          >
            {model.name} — {formatCost(model.cost)}/image
            {model.tag ? ` (${model.tag})` : ""}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2 text-xs text-white/40">
        <span>
          Cost: {formatCost(MODELS.find((m) => m.id === selectedModel)?.cost ?? 0)}/image
        </span>
        {MODELS.find((m) => m.id === selectedModel)?.tag && (
          <Badge variant="accent">
            {MODELS.find((m) => m.id === selectedModel)!.tag}
          </Badge>
        )}
      </div>
    </div>
  );
}
