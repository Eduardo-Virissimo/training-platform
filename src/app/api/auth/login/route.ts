import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createAccessToken, createRefreshToken } from '@/lib/auth';
import { response } from '@/lib/http/response';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return response.error('Email e senha são obrigatórios.', 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return response.unauthorized('Email ou senha incorretos.');
    }

    const accessToken = await createAccessToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    const refreshToken = await createRefreshToken(user.id);

    const responseCookies = NextResponse.json(
      { message: 'Login realizado com sucesso!' },
      { status: 200 }
    );

    responseCookies.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15,
      path: '/',
    });

    responseCookies.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return responseCookies;
  } catch (error) {
    console.error('Erro no login:', error);
    return response.internalError('Erro interno do servidor.');
  }
}
