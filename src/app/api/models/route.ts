import { NextResponse } from "next/server";
import { fetchImageModels } from "@/lib/models";

export const revalidate = 300;

export async function GET() {
  try {
    const models = await fetchImageModels();
    return NextResponse.json({ models });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load models";
    return NextResponse.json({ error: message, models: [] }, { status: 502 });
  }
}
