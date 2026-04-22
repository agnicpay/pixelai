"use client";

import { useEffect, useState } from "react";
import type { ImageModel } from "@/lib/models";
import { DEFAULT_MODEL_ID } from "@/lib/constants";
import Badge from "@/components/ui/Badge";

interface ModelSelectorProps {
  selectedModel: string;
  onSelect: (modelId: string) => void;
  onModelsLoaded?: (models: ImageModel[]) => void;
}

function formatPerImage(m: ImageModel): string {
  if (m.perImageEstimate !== null) {
    const v = m.perImageEstimate;
    if (v < 0.001) return `$${v.toFixed(5)}/img`;
    if (v < 0.01) return `$${v.toFixed(4)}/img`;
    return `$${v.toFixed(3)}/img`;
  }
  return m.unitPriceLabel || "per-unit";
}

export default function ModelSelector({
  selectedModel,
  onSelect,
  onModelsLoaded,
}: ModelSelectorProps) {
  const [models, setModels] = useState<ImageModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/models");
        const data = await res.json();
        if (cancelled) return;
        const list: ImageModel[] = data.models || [];
        setModels(list);
        onModelsLoaded?.(list);
        if (list.length > 0 && !list.find((m) => m.id === selectedModel)) {
          const fallback = list.find((m) => m.id === DEFAULT_MODEL_ID) || list[0];
          onSelect(fallback.id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load models");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally only run on mount — the model list is a read-once snapshot
    // for the session; changing selectedModel shouldn't refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = models.find((m) => m.id === selectedModel);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white/60">Model</label>
      <select
        value={selectedModel}
        onChange={(e) => onSelect(e.target.value)}
        disabled={loading || models.length === 0}
        className="w-full rounded-xl glass px-4 py-2.5 text-white text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none cursor-pointer disabled:opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='rgba(255,255,255,0.4)' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
        }}
      >
        {loading && <option>Loading models…</option>}
        {!loading && models.length === 0 && <option>No models available</option>}
        {models.map((model) => (
          <option
            key={model.id}
            value={model.id}
            className="bg-surface text-white"
          >
            {model.shortName} — {formatPerImage(model)}
            {model.tag ? ` (${model.tag})` : ""}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2 text-xs text-white/40 min-h-[20px]">
        {error && <span className="text-red-400">{error}</span>}
        {current && (
          <>
            <span>Cost: {formatPerImage(current)}</span>
            {current.tag && <Badge variant="accent">{current.tag}</Badge>}
            {!current.supportsReferenceImage && (
              <span className="text-white/30">· no reference image</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
