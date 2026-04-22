import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/auth";
import { generateImage, getBalance } from "@/lib/agnic";
import { STYLES, DEFAULT_MODEL_ID } from "@/lib/constants";
import { fetchImageModels } from "@/lib/models";

export const dynamic = "force-dynamic";

const MAX_REFERENCE_IMAGE_CHARS = 900_000;
const MAX_REFERENCE_IMAGES = 3;

export async function POST(req: NextRequest) {
  try {
    const token = await getValidAccessToken();
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { prompt, model, style, referenceImage, referenceImages } = body as {
      prompt?: string;
      model?: string;
      style?: string;
      referenceImage?: string;
      referenceImages?: string[];
    };

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const selectedStyle = STYLES.find((s) => s.id === style);
    const fullPrompt = selectedStyle?.suffix
      ? `${prompt.trim()}${selectedStyle.suffix}`
      : prompt.trim();

    const selectedModel = model || DEFAULT_MODEL_ID;

    const models = await fetchImageModels();
    const modelConfig = models.find((m) => m.id === selectedModel);
    if (!modelConfig) {
      return NextResponse.json(
        { error: `Unknown model: ${selectedModel}` },
        { status: 400 },
      );
    }

    // Accept both the legacy single-image field and the new array; coalesce
    // into one canonical list for validation + transport.
    const rawList = Array.isArray(referenceImages)
      ? referenceImages
      : referenceImage
        ? [referenceImage]
        : [];

    const validImages = rawList.filter(
      (s): s is string => typeof s === "string" && s.startsWith("data:image/"),
    );

    if (validImages.length > MAX_REFERENCE_IMAGES) {
      return NextResponse.json(
        { error: `At most ${MAX_REFERENCE_IMAGES} reference images allowed.` },
        { status: 400 },
      );
    }

    if (validImages.length > 0 && !modelConfig.supportsReferenceImage) {
      return NextResponse.json(
        { error: "Selected model does not support reference images" },
        { status: 400 },
      );
    }

    for (const img of validImages) {
      if (img.length > MAX_REFERENCE_IMAGE_CHARS) {
        return NextResponse.json(
          { error: "Reference image too large. Please upload a smaller image." },
          { status: 413 },
        );
      }
    }

    const result = await generateImage(
      fullPrompt,
      selectedModel,
      token,
      validImages,
    );

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
