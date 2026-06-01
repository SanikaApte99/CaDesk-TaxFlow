import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getValidAccessToken, fetchTaxEmails } from "@/lib/gmail";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const adminEmail = session.user.email;

  try {
    const tokenDoc = await convex.query(api.gmailTokens.getToken, {
      adminEmail,
    });

    if (!tokenDoc) {
      return NextResponse.json(
        { error: "Gmail not connected" },
        { status: 404 },
      );
    }

    const { accessToken, expiryDate, refreshed } = await getValidAccessToken(
      tokenDoc.accessToken,
      tokenDoc.refreshToken,
      tokenDoc.expiryDate,
    );

    if (refreshed) {
      await convex.mutation(api.gmailTokens.updateAccessToken, {
        adminEmail,
        accessToken,
        expiryDate,
      });
    }

    const emails = await fetchTaxEmails(accessToken);

    return NextResponse.json({ emails });
  } catch (err: any) {
    console.error("Gmail fetch error:", err);

    if (err?.message?.includes("invalid_grant")) {
      return NextResponse.json(
        { error: "Gmail token expired. Please reconnect." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch emails" },
      { status: 500 },
    );
  }
}
