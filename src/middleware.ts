import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Check if accessing admin routes
    if (pathname.startsWith("/admin")) {
      // Check if user is admin
      const isAdmin = token?.discordId === process.env.ADMIN_DISCORD_ID;
      
      if (!isAdmin) {
        // Redirect non-admin users to dashboard with error message
        return NextResponse.redirect(
          new URL("/dashboard?error=access_denied", req.url)
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to public routes
        if (pathname.startsWith("/login") || 
            pathname.startsWith("/signup") || 
            pathname === "/" ||
            pathname.startsWith("/api/auth")) {
          return true;
        }
        
        // For all other routes, require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/leaderboard/:path*"
  ]
};

