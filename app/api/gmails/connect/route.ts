import { NextRequest, NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/gmail";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const authUrl = getAuthUrl();

  return NextResponse.redirect(authUrl);
}
