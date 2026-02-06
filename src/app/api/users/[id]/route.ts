import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id },
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

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuário' },
      { status: 500 }
    );
  }
}

// UPDATE user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();

    // Remove fields that shouldn't be updated directly
    const { senha: _senha, email: _email, id: _id, criadoEm: _criadoEm, ...updateData } = data;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    );
  }
}
