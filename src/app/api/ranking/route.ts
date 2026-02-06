import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const orderBy = searchParams.get('orderBy') || 'vitorias';

    // Get top users ordered by the specified field
    const users = await prisma.user.findMany({
      take: limit,
      orderBy: {
        [orderBy]: 'desc',
      },
      select: {
        id: true,
        nome: true,
        avatar: true,
        fichas: true,
        nivel: true,
        experiencia: true,
        vitorias: true,
        derrotas: true,
        partidasJogadas: true,
      },
    });

    // Calculate ranking position and score
    const ranking = users.map((user, index) => ({
      posicao: index + 1,
      usuario: user,
      pontuacao: user.vitorias * 3 + user.nivel * 10 + Math.floor(user.experiencia / 10),
    }));

    return NextResponse.json({ ranking }, { status: 200 });
  } catch (error) {
    console.error('Ranking error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar ranking' },
      { status: 500 }
    );
  }
}
