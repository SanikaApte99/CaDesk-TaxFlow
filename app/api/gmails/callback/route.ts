import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { exchangeCodeForTokens } from "@/lib/gmail";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/dashboard?gmail=denied", req.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.refresh_token) {
      return NextResponse.redirect(
        new URL("/dashboard?gmail=no_refresh_token", req.url),
      );
    }

    await convex.mutation(api.gmailTokens.saveToken, {
      adminEmail: session.user.email,
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token!,
      expiryDate: tokens.expiry_date!,
    });

    return NextResponse.redirect(
      new URL("/dashboard?gmail=connected", req.url),
    );
  } catch (err) {
    console.error("Gmail OAuth error:", err);
    return NextResponse.redirect(new URL("/dashboard?gmail=error", req.url));
  }
}
