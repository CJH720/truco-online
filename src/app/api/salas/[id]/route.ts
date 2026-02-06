import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single room by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const sala = await prisma.sala.findUnique({
      where: { id },
      include: {
        criador: {
          select: {
            id: true,
            nome: true,
            avatar: true,
          },
        },
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
          orderBy: {
            posicao: 'asc',
          },
        },
      },
    });

    if (!sala) {
      return NextResponse.json(
        { error: 'Sala não encontrada' },
        { status: 404 }
      );
    }

    const salaFormatted = {
      id: sala.id,
      nome: sala.nome,
      codigo: sala.codigo,
      criador: sala.criadorId,
      jogadores: sala.jogadores.map((sj) => ({
        id: sj.user.id,
        nome: sj.user.nome,
        avatar: sj.user.avatar,
        fichas: sj.user.fichas,
        posicao: sj.posicao,
        cartas: [],
        online: sj.online,
      })),
      maxJogadores: sala.maxJogadores,
      aposta: sala.aposta,
      status: sala.status,
      privada: sala.privada,
      variante: sala.variante,
      criadoEm: sala.criadoEm,
    };

    return NextResponse.json({ sala: salaFormatted }, { status: 200 });
  } catch (error) {
    console.error('Get sala error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar sala' },
      { status: 500 }
    );
  }
}

// PATCH update room (status, etc)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();

    const sala = await prisma.sala.update({
      where: { id },
      data,
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
        },
      },
    });

    return NextResponse.json({ sala }, { status: 200 });
  } catch (error) {
    console.error('Update sala error:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar sala' },
      { status: 500 }
    );
  }
}

// DELETE room
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.sala.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Delete sala error:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar sala' },
      { status: 500 }
    );
  }
}
