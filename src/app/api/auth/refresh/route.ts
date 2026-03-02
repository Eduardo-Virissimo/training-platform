import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAccessToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const redirect = request.nextUrl.searchParams.get("redirect") || "/dashboard";

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    // token não existe ou expirou
    if (!stored || stored.expiresAt < new Date()) {
      if (stored) {
        await prisma.refreshToken.delete({ where: { id: stored.id } });
      }

      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
      response.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
      return response;
    }

    const newAccessToken = await createAccessToken({
      id: stored.user.id,
      email: stored.user.email,
      name: stored.user.name,
    });

    const response = NextResponse.redirect(new URL(redirect, request.url));

    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Erro no refresh:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
