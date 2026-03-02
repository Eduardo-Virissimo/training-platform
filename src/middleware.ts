import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";

const publicRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // rota pública: se já tem token válido, redireciona pro dashboard
  if (publicRoutes.includes(pathname)) {
    if (accessToken) {
      const session = await verifyAccessToken(accessToken);
      if (session) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
    return NextResponse.next();
  }

  // rota protegida: valida o access token
  if (accessToken) {
    const session = await verifyAccessToken(accessToken);
    if (session) return NextResponse.next();
  }

  // access token expirou mas tem refresh token: tenta renovar
  if (refreshToken) {
    const refreshUrl = new URL("/api/auth/refresh", request.url);
    refreshUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(refreshUrl);
  }

  // sem autenticação: redireciona pro login
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
