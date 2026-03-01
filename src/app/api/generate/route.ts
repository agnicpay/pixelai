import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/auth";
import { generateImage, getBalance } from "@/lib/agnic";
import { STYLES, DEFAULT_MODEL } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const token = await getValidAccessToken();
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { prompt, model, style } = body as {
      prompt?: string;
      model?: string;
      style?: string;
    };

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Build enhanced prompt with style suffix
    const selectedStyle = STYLES.find((s) => s.id === style);
    const fullPrompt = selectedStyle?.suffix
      ? `${prompt.trim()}${selectedStyle.suffix}`
      : prompt.trim();

    const selectedModel = model || DEFAULT_MODEL.id;

    const result = await generateImage(fullPrompt, selectedModel, token);

    // Fetch updated balance
    let balance: number | undefined;
    try {
      balance = await getBalance(token);
    } catch {
      // Balance fetch is non-critical
    }

    return NextResponse.json({
      image: result.image,
      text: result.text,
      model: result.model,
      balance,
    });
  } catch (error) {
    console.error("Generation error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate image";
    const isInsufficientBalance =
      message.toLowerCase().includes("insufficient");
    return NextResponse.json(
      {
        error: message,
        ...(isInsufficientBalance && { code: "insufficient_balance" }),
      },
      { status: isInsufficientBalance ? 402 : 500 },
    );
  }
}
