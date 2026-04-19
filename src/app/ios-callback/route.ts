import { NextRequest, NextResponse } from "next/server";

// Relay the Agnic OAuth callback into the iOS app's custom URL scheme.
// The pixelai OAuth client has dreamt.cards as an allowed redirect domain,
// and this new client ("Dreamt iOS") registers https://dreamt.cards/ios-callback.
// This route forwards the code to the ASWebAuthenticationSession via dreamtcards://.
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams.toString();
  const appURL = `dreamtcards://callback${params ? "?" + params : ""}`;
  return NextResponse.redirect(appURL);
}
