import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role as string | undefined;

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
  },
  {
    callbacks: {
      // Only run middleware if user is authenticated
      authorized: ({ token }) => !!token,
    },
  },
);

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
