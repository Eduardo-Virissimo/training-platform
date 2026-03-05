import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { response } from '@/lib/http/response';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return response.error('Nome, email e senha são obrigatórios.');
    }

    if (password.length < 6) {
      return response.error('A senha deve ter pelo menos 6 caracteres.');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return response.conflictError('Este email já está cadastrado.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return response.created({
      message: 'Conta criada com sucesso!',
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    return response.internalError('Erro interno do servidor.');
  }
}
