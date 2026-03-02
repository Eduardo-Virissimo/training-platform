import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createAccessToken, createRefreshToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: "Email ou senha incorretos." },
        { status: 401 },
      );
    }

    const accessToken = await createAccessToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    const refreshToken = await createRefreshToken(user.id);

    const response = NextResponse.json(
      { message: "Login realizado com sucesso!" },
      { status: 200 },
    );

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 },
    );
  }
}
