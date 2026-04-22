import OpenAI from "openai";
import { AGNIC_API_BASE } from "./constants";

export function createAgnicClient(accessToken: string) {
  return new OpenAI({
    apiKey: accessToken,
    baseURL: `${AGNIC_API_BASE}/v1`,
  });
}

// Raw /v1/chat/completions response shape (OpenRouter-compatible). We use a
// direct fetch for image generation because the OpenAI SDK only models its
// own schema and silently drops the non-standard `message.images[]` field
// that OpenRouter returns for image-output models — so the SDK path was
// handing us a response with no image even though the gateway had one.
interface RawCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
      images?: Array<{ image_url?: { url?: string } }>;
    };
  }>;
  usage?: unknown;
  error?: { message?: string; code?: string | number };
}

export async function generateImage(
  prompt: string,
  model: string,
  accessToken: string,
  referenceImages?: string[],
) {
  const refs = (referenceImages || []).filter(
    (s): s is string => typeof s === "string" && s.length > 0,
  );

  const content =
    refs.length > 0
      ? [
          { type: "text", text: prompt },
          ...refs.map((url) => ({
            type: "image_url" as const,
            image_url: { url },
          })),
        ]
      : prompt;

  const res = await fetch(`${AGNIC_API_BASE}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content }],
      modalities: ["image", "text"],
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const bodyText = await res.text();
    throw new Error(
      `Agnic API error ${res.status}: ${bodyText.slice(0, 500)}`,
    );
  }

  const data: RawCompletionResponse = await res.json();

  if (data.error) {
    throw new Error(data.error.message || "Agnic API returned an error");
  }

  const message = data.choices?.[0]?.message;
  const imageUrl = message?.images?.[0]?.image_url?.url || null;
  const text = message?.content || "";

  return {
    image: imageUrl,
    text,
    model,
    usage: data.usage,
  };
}

export async function enhancePrompt(
  prompt: string,
  accessToken: string,
): Promise<string> {
  const client = createAgnicClient(accessToken);

  const response = await client.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert AI image prompt engineer. Enhance the user's prompt to produce a more vivid, detailed, and visually stunning image. Keep the core concept, but add specifics about lighting, composition, mood, colors, and artistic details. Output ONLY the enhanced prompt, nothing else. Keep it under 200 words.",
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 300,
  });

  return response.choices[0]?.message?.content || prompt;
}

export async function getBalance(accessToken: string): Promise<number> {
  const res = await fetch(`${AGNIC_API_BASE}/api/balance?network=base`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch balance: ${res.status}`);
  }

  const data = await res.json();
  const usdc = parseFloat(data.usdcBalance ?? "0") || 0;
  const credit = parseFloat(data.creditBalance ?? "0") || 0;
  return usdc + credit;
}
