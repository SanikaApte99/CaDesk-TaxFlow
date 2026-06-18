import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role as string | undefined;

  if (!req.auth) {
    const signInUrl = new URL("/login", req.url);
    return NextResponse.redirect(signInUrl);
  }

  //  Admin-only routes
  const adminOnly = ["/settings"];
  if (adminOnly.some((r) => pathname.startsWith(r))) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  //  Senior CA + Admin routes
  const seniorAndAdmin = ["/notices", "/ai"];
  if (seniorAndAdmin.some((r) => pathname.startsWith(r))) {
    if (role !== "admin" && role !== "senior-ca") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // All other protected routes — any authenticated user can access
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/filings/:path*",
    "/notices/:path*",
    "/deadlines/:path*",
    "/calculators/:path*",
    "/ai/:path*",
    "/settings/:path*",
  ],
};
