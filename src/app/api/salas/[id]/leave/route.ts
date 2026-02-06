import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST leave a room
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

    // Remove player from room
    await prisma.salaJogador.deleteMany({
      where: {
        salaId,
        userId,
      },
    });

    // Get remaining players
    const remainingPlayers = await prisma.salaJogador.findMany({
      where: { salaId },
    });

    if (remainingPlayers.length === 0) {
      // Delete empty room
      await prisma.sala.delete({
        where: { id: salaId },
      });

      return NextResponse.json({ success: true, roomDeleted: true }, { status: 200 });
    }

    // Update room status
    await prisma.sala.update({
      where: { id: salaId },
      data: { status: 'aguardando' },
    });

    // Reassign positions
    for (let i = 0; i < remainingPlayers.length; i++) {
      await prisma.salaJogador.update({
        where: { id: remainingPlayers[i].id },
        data: { posicao: i },
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Leave sala error:', error);
    return NextResponse.json(
      { error: 'Erro ao sair da sala' },
      { status: 500 }
    );
  }
}
