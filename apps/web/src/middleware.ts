import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  defaultLocale,
  localeCookieName,
  localeHeaderName,
  type Locale,
} from "@/i18n/config";
import {
  detectPreferredLocale,
  isLocale,
  stripLocaleFromPathname,
} from "@/i18n/locale";

function isBypassedPath(pathname: string) {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  );
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isBypassedPath(pathname)) {
    return NextResponse.next();
  }

  const { locale, pathname: internalPathname } = stripLocaleFromPathname(pathname);

  if (!locale) {
    const cookieLocale = request.cookies.get(localeCookieName)?.value;
    let preferredCookieLocale: Locale | null = null;
    if (isLocale(cookieLocale ?? "")) {
      preferredCookieLocale = cookieLocale as Locale;
    }
    const detectedLocale: Locale =
      preferredCookieLocale ??
      detectPreferredLocale(request.headers.get("accept-language")) ??
      defaultLocale;
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${detectedLocale}${pathname === "/" ? "" : pathname}`;

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set(localeCookieName, detectedLocale, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(localeHeaderName, locale);

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = internalPathname;
  rewriteUrl.search = search;

  const response = NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders,
    },
  });

  response.cookies.set(localeCookieName, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
