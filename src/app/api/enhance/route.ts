import { NextRequest, NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/auth";
import { enhancePrompt, getBalance } from "@/lib/agnic";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const token = await getValidAccessToken();
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { prompt } = body as { prompt?: string };

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const enhancedPrompt = await enhancePrompt(prompt.trim(), token);

    let balance: number | undefined;
    try {
      balance = await getBalance(token);
    } catch {
      // non-critical
    }

    return NextResponse.json({ enhancedPrompt, balance });
  } catch (error) {
    console.error("Enhance error:", error);
    return NextResponse.json(
      { error: "Failed to enhance prompt" },
      { status: 500 },
    );
  }
}
