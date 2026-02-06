import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { nome, email, senha } = await request.json();

    // Validate input
    if (!nome || !email || !senha) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este e-mail já está cadastrado' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
        fichas: 1000,
        nivel: 1,
        experiencia: 0,
        vitorias: 0,
        derrotas: 0,
        partidasJogadas: 0,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        avatar: true,
        fichas: true,
        nivel: true,
        experiencia: true,
        vitorias: true,
        derrotas: true,
        partidasJogadas: true,
        criadoEm: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar conta. Tente novamente.' },
      { status: 500 }
    );
  }
}
