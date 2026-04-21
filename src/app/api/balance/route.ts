import { NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/auth";
import { getBalance } from "@/lib/agnic";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = await getValidAccessToken();
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const balance = await getBalance(token);
    return NextResponse.json({ balance });
  } catch (error) {
    console.error("Balance error:", error);
    return NextResponse.json(
      { error: "Failed to fetch balance" },
      { status: 500 },
    );
  }
}
