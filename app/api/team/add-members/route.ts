import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  // Only admin can add members
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "All fields are required" },
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
    const firmId = (session.user as any).firmId as Id<"firms">;

    await convex.mutation(api.auth.addTeamMember, {
      firmId,
      name,
      email,
      passwordHash,
      role,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.message?.includes("EMAIL_EXISTS")) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 },
      );
    }
    console.error("Add member error:", err);
    return NextResponse.json(
      { error: "Failed to add member. Please try again." },
      { status: 500 },
    );
  }
}
