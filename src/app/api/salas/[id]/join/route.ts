import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST join a room
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: salaId } = params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    // Get room with current players
    const sala = await prisma.sala.findUnique({
      where: { id: salaId },
      include: {
        jogadores: {
          orderBy: { posicao: 'asc' },
        },
      },
    });

    if (!sala) {
      return NextResponse.json(
        { error: 'Sala não encontrada' },
        { status: 404 }
      );
    }

    if (sala.jogadores.length >= 4) {
      return NextResponse.json(
        { error: 'Sala cheia' },
        { status: 400 }
      );
    }

    // Check if user is already in room
    const existingPlayer = sala.jogadores.find((j) => j.userId === userId);
    if (existingPlayer) {
      // Update online status
      await prisma.salaJogador.update({
        where: { id: existingPlayer.id },
        data: { online: true },
      });

      return NextResponse.json({ success: true, message: 'Reconectado' }, { status: 200 });
    }

    // Check user has enough chips
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fichas: true },
    });

    if (!user || user.fichas < sala.aposta) {
      return NextResponse.json(
        { error: 'Fichas insuficientes' },
        { status: 400 }
      );
    }

    // Find next available position
    const takenPositions = sala.jogadores.map((j) => j.posicao);
    let nextPosition = 0;
    for (let i = 0; i < 4; i++) {
      if (!takenPositions.includes(i)) {
        nextPosition = i;
        break;
      }
    }

    // Add player to room
    await prisma.salaJogador.create({
      data: {
        salaId,
        userId,
        posicao: nextPosition,
        online: true,
      },
    });

    // Update room status if full
    if (sala.jogadores.length + 1 >= 4) {
      await prisma.sala.update({
        where: { id: salaId },
        data: { status: 'cheia' },
      });
    }

    // Get updated room
    const updatedSala = await prisma.sala.findUnique({
      where: { id: salaId },
      include: {
        jogadores: {
          include: {
            user: {
              select: {
                id: true,
                nome: true,
                avatar: true,
                fichas: true,
              },
            },
          },
          orderBy: { posicao: 'asc' },
        },
      },
    });

    const salaFormatted = {
      id: updatedSala!.id,
      nome: updatedSala!.nome,
      codigo: updatedSala!.codigo,
      criador: updatedSala!.criadorId,
      jogadores: updatedSala!.jogadores.map((sj) => ({
        id: sj.user.id,
        nome: sj.user.nome,
        avatar: sj.user.avatar,
        fichas: sj.user.fichas,
        posicao: sj.posicao,
        cartas: [],
        online: sj.online,
      })),
      maxJogadores: updatedSala!.maxJogadores,
      aposta: updatedSala!.aposta,
      status: updatedSala!.status,
      privada: updatedSala!.privada,
      variante: updatedSala!.variante,
      criadoEm: updatedSala!.criadoEm,
    };

    return NextResponse.json({ sala: salaFormatted }, { status: 200 });
  } catch (error) {
    console.error('Join sala error:', error);
    return NextResponse.json(
      { error: 'Erro ao entrar na sala' },
      { status: 500 }
    );
  }
}
