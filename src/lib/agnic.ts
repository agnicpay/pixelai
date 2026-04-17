import OpenAI from "openai";
import { AGNIC_API_BASE } from "./constants";

export function createAgnicClient(accessToken: string) {
  return new OpenAI({
    apiKey: accessToken,
    baseURL: `${AGNIC_API_BASE}/v1`,
  });
}

export async function generateImage(
  prompt: string,
  model: string,
  accessToken: string,
  referenceImage?: string,
) {
  const client = createAgnicClient(accessToken);

  const content = referenceImage
    ? [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: referenceImage } },
      ]
    : prompt;

  const response = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content }] as never,
    modalities: ["image", "text"] as unknown as ["text"],
    max_tokens: 1024,
  });

  const choice = response.choices[0];
  const message = choice?.message as unknown as Record<string, unknown>;
  const images = message?.images as Array<{ image_url: { url: string } }> | undefined;
  const imageUrl = images?.[0]?.image_url?.url;
  const text = (message?.content as string) || "";

  const usage = response.usage;

  return {
    image: imageUrl || null,
    text,
    model,
    usage,
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
