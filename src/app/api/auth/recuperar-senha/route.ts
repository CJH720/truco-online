import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'E-mail não encontrado' },
        { status: 404 }
      );
    }

    // In production, you would send an email with reset instructions
    // For now, just return success
    return NextResponse.json(
      { message: 'Instruções de recuperação enviadas para o e-mail' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password recovery error:', error);
    return NextResponse.json(
      { error: 'Erro ao recuperar senha. Tente novamente.' },
      { status: 500 }
    );
  }
}
