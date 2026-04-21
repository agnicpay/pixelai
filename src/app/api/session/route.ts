import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getValidAccessToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = await getValidAccessToken();
  return NextResponse.json({
    authenticated: !!token,
  });
}

export async function DELETE() {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ success: true });
}
