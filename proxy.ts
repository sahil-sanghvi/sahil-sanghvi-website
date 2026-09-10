import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Next 16 renamed `middleware.ts` to `proxy.ts` (and `middleware` export to
// `proxy`). Matcher stays off every public/(site)/terminal route on purpose —
// those pages use the cookie-free public client precisely so cookies() is
// never called on them and ISR keeps working. This proxy only runs where
// auth actually needs to be checked.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Static content mode (default): no Supabase, so nothing to auth-gate here.
  // The /admin layout renders an "automation disabled" explainer instead.
  if (process.env.CONTENT_SOURCE !== "supabase" || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  if (isAdminRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    const { data: allowlisted } = await supabase
      .from("admin_allowlist")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!allowlisted) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "not_admin");
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/auth/:path*"],
};
