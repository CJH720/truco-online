import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET all available rooms
export async function GET() {
  try {
    const salas = await prisma.sala.findMany({
      where: {
        status: {
          not: 'jogando',
        },
      },
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
      orderBy: {
        criadoEm: 'desc',
      },
    });

    // Transform to match frontend expected format
    const salasFormatted = salas.map((sala) => ({
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
    }));

    return NextResponse.json({ salas: salasFormatted }, { status: 200 });
  } catch (error) {
    console.error('Get salas error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar salas' },
      { status: 500 }
    );
  }
}

// POST create a new room
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { nome, aposta, privada, variante, criadorId } = data;

    if (!nome || !criadorId) {
      return NextResponse.json(
        { error: 'Nome e criadorId são obrigatórios' },
        { status: 400 }
      );
    }

    // Generate unique room code
    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create room with creator as first player
    const sala = await prisma.sala.create({
      data: {
        nome,
        codigo,
        criadorId,
        aposta: aposta || 0,
        privada: privada || false,
        variante: variante || 'paulista',
        jogadores: {
          create: {
            userId: criadorId,
            posicao: 0,
            online: true,
          },
        },
      },
      include: {
        criador: {
          select: {
            id: true,
            nome: true,
            avatar: true,
            fichas: true,
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
        },
      },
    });

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

    return NextResponse.json({ sala: salaFormatted }, { status: 201 });
  } catch (error) {
    console.error('Create sala error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar sala' },
      { status: 500 }
    );
  }
}
