import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firmName, gstin, city, phone, adminName, adminEmail, password } =
      body;

    if (!firmName || !adminName || !adminEmail || !password) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await convex.mutation(api.auth.registerFirm, {
      firmName,
      gstin: gstin || undefined,
      city: city || undefined,
      phone: phone || undefined,
      adminName,
      adminEmail,
      passwordHash,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    if (err?.message?.includes("EMAIL_EXISTS")) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}
