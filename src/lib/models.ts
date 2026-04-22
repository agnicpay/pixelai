// Dynamic image-model catalog sourced from the Agnic gateway. Previously this
// was a hand-maintained list in constants.ts that drifted out of sync with
// what the gateway actually serves; now we fetch the canonical list and apply
// the same 20% Agnic discount the agnicwallet frontend uses.

export const MODELS_API_URL =
  "https://gw.agnic.ai/api/v1/models?output_modalities=image";

// Marketing-facing Agnic discount vs. upstream OpenRouter prices.
export const AGNIC_PRICE_REDUCTION = 0.2;

// Gemini emits ~1290 tokens per generated image (per Google docs); OpenAI's
// gpt-image family uses ~1024. Good enough for per-image cost estimates.
const IMAGE_OUTPUT_TOKENS_GEMINI = 1290;
const IMAGE_OUTPUT_TOKENS_OPENAI = 1024;

export interface RawOpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number | null;
  created?: number | null;
  architecture?: {
    input_modalities?: string[];
    output_modalities?: string[];
  };
  pricing: {
    prompt?: string;
    completion?: string;
    image?: string;
    request?: string;
  };
  top_provider?: { is_moderated?: boolean };
}

interface OpenRouterResponse {
  data: RawOpenRouterModel[];
}

export interface ImageModel {
  id: string;
  name: string;
  shortName: string;
  description: string;
  // Agnic-discounted per-million-token prices for display.
  inputPerMillion: number;
  outputPerMillion: number;
  // Best-effort per-image USD estimate. `null` when the model is billed
  // per-unit by the provider and OpenRouter doesn't expose structured pricing.
  perImageEstimate: number | null;
  // Short label for the price column when perImageEstimate is null.
  unitPriceLabel: string | null;
  tag: string | null;
  supportsReferenceImage: boolean;
  isDefault: boolean;
}

export const DEFAULT_MODEL_ID = "google/gemini-2.5-flash-image";

// Curated tag hints for the UI. Not all gateway models get one; that's fine.
const TAG_HINTS: Array<{ test: (id: string) => boolean; tag: string }> = [
  { test: (id) => id === DEFAULT_MODEL_ID, tag: "Best Value" },
  { test: (id) => id === "google/gemini-3-pro-image-preview", tag: "High Quality" },
  { test: (id) => id === "openai/gpt-5-image-mini", tag: "Cheapest" },
  { test: (id) => /flux\.2-pro|flux\.2-max/.test(id), tag: "Premium" },
  { test: (id) => /nano-banana|flash-image/.test(id), tag: "Fast" },
];

function perTokenToPerMillion(price: string | undefined): number {
  if (!price) return 0;
  const n = parseFloat(price);
  return Number.isFinite(n) && n > 0 ? n * 1_000_000 : 0;
}

function parseUnitPriceFromDescription(description?: string): {
  perImage: number | null;
  label: string | null;
} {
  if (!description) return { perImage: null, label: null };
  // "$0.06 per image", "priced at $0.08 per song", "from $0.04/image"
  const perUnit = description.match(
    /\$(\d+(?:\.\d+)?)\s*(?:per|\/)\s*(image|song|clip|second|minute)/i,
  );
  if (perUnit) {
    const amount = parseFloat(perUnit[1]);
    const unit = perUnit[2].toLowerCase();
    const discounted = amount * (1 - AGNIC_PRICE_REDUCTION);
    if (unit === "image") {
      return {
        perImage: discounted,
        label: `$${discounted.toFixed(3)}/img`,
      };
    }
    return { perImage: null, label: `$${discounted.toFixed(3)}/${unit}` };
  }
  return { perImage: null, label: null };
}

function shortNameFromId(id: string, name: string): string {
  // Strip the vendor prefix ("Google:", "OpenAI:") and parenthetical tech IDs
  // so the picker stays readable.
  const stripped = name.replace(/^[^:]+:\s*/, "").replace(/\s*\([^)]*\)\s*$/, "");
  return stripped || id.split("/").pop() || id;
}

function estimatePerImage(model: RawOpenRouterModel): number | null {
  const promptPerToken = parseFloat(model.pricing.prompt || "0") || 0;
  const completionPerToken = parseFloat(model.pricing.completion || "0") || 0;
  const imagePerToken = parseFloat(model.pricing.image || "0") || 0;

  // Models like Gemini expose a per-image-token price distinct from text
  // tokens — use that when available.
  if (imagePerToken > 0) {
    const tokens = /gemini/i.test(model.id)
      ? IMAGE_OUTPUT_TOKENS_GEMINI
      : IMAGE_OUTPUT_TOKENS_OPENAI;
    const raw = imagePerToken * tokens;
    return raw * (1 - AGNIC_PRICE_REDUCTION);
  }

  // OpenAI image models bill image output via the completion rate.
  if (completionPerToken > 0 && /openai\//i.test(model.id)) {
    const raw = completionPerToken * IMAGE_OUTPUT_TOKENS_OPENAI;
    return raw * (1 - AGNIC_PRICE_REDUCTION);
  }

  // Fall back to description-scraped per-image price if present.
  const { perImage } = parseUnitPriceFromDescription(model.description);
  if (perImage !== null) return perImage;

  // As a last resort, estimate from prompt+completion assuming ~200 prompt
  // tokens and 1024 output tokens — only for text+image models.
  if (promptPerToken > 0 || completionPerToken > 0) {
    const raw = promptPerToken * 200 + completionPerToken * IMAGE_OUTPUT_TOKENS_OPENAI;
    return raw * (1 - AGNIC_PRICE_REDUCTION);
  }

  return null;
}

export function transformModel(model: RawOpenRouterModel): ImageModel {
  const inputModalities = model.architecture?.input_modalities || [];
  const supportsReferenceImage = inputModalities.includes("image");

  const perImageEstimate = estimatePerImage(model);
  const { label: unitPriceLabel } = parseUnitPriceFromDescription(model.description);

  const tag = TAG_HINTS.find((h) => h.test(model.id))?.tag || null;

  return {
    id: model.id,
    name: model.name || model.id,
    shortName: shortNameFromId(model.id, model.name || model.id),
    description: model.description || "",
    inputPerMillion:
      perTokenToPerMillion(model.pricing.prompt) * (1 - AGNIC_PRICE_REDUCTION),
    outputPerMillion:
      perTokenToPerMillion(model.pricing.completion) * (1 - AGNIC_PRICE_REDUCTION),
    perImageEstimate,
    unitPriceLabel: perImageEstimate === null ? unitPriceLabel || "per-unit" : null,
    tag,
    supportsReferenceImage,
    isDefault: model.id === DEFAULT_MODEL_ID,
  };
}

// Server-side fetch with Next.js fetch cache (5-min revalidate).
export async function fetchImageModels(): Promise<ImageModel[]> {
  const res = await fetch(MODELS_API_URL, { next: { revalidate: 300 } });
  if (!res.ok) {
    throw new Error(`Gateway returned ${res.status} ${res.statusText}`);
  }
  const data: OpenRouterResponse = await res.json();

  const models = (data.data || [])
    .filter((m) => m.id !== "openrouter/auto")
    .filter((m) =>
      (m.architecture?.output_modalities || []).includes("image"),
    )
    .map(transformModel);

  // Put the default first, then cheapest estimable, then per-unit models.
  models.sort((a, b) => {
    if (a.isDefault) return -1;
    if (b.isDefault) return 1;
    const ae = a.perImageEstimate;
    const be = b.perImageEstimate;
    if (ae === null && be === null) return a.shortName.localeCompare(b.shortName);
    if (ae === null) return 1;
    if (be === null) return -1;
    return ae - be;
  });

  return models;
}
