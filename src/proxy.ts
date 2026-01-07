import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

export default async function proxy(request: NextRequest) {
  // 1. Update session (refresh cookies)
  const response = await updateSession(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // 2. Redirect unauthenticated users to /login (except for /login itself and static assets)
  if (!user && path !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. If authenticated and on root path, we might want to redirect based on role
  // But let's first handle the specific route protections
  if (user) {
    // Fetch user profile for role-based access
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (path === "/login") {
      // Driver -> Direct to Delivery Dashboard
      if (profile?.role === "driver") {
        return NextResponse.redirect(new URL("/delivery", request.url));
      }
      // Admin / Super Admin -> Dashboard Selection (Root)
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Protection for /super-admin
    if (path.startsWith("/super-admin")) {
      if (profile?.role !== "super_admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // Protection for /admin
    if (path.startsWith("/admin")) {
      if (profile?.role !== "admin" && profile?.role !== "super_admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // Protection for /delivery
    if (path.startsWith("/delivery")) {
      if (
        profile?.role !== "driver" &&
        profile?.role !== "admin" &&
        profile?.role !== "super_admin"
      ) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
