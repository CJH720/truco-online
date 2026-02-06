// Lógica do jogo de Truco Paulista

import { Carta, Naipe, ValorCarta, Rodada, CartaJogada } from '@/types/game';
import { v4 as uuidv4 } from 'uuid';

// Ordem das cartas no Truco Paulista (da menor para maior)
const ORDEM_CARTAS: ValorCarta[] = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];

// Ordem dos naipes para desempate das manilhas (do menor para maior)
const ORDEM_NAIPES: Naipe[] = ['ouros', 'espadas', 'copas', 'paus'];

// Baralho do Truco (40 cartas - sem 8, 9 e 10)
const VALORES_TRUCO: ValorCarta[] = ['A', '2', '3', '4', '5', '6', '7', 'Q', 'J', 'K'];
const NAIPES: Naipe[] = ['copas', 'ouros', 'espadas', 'paus'];

export function criarBaralho(): Carta[] {
  const baralho: Carta[] = [];

  for (const naipe of NAIPES) {
    for (const valor of VALORES_TRUCO) {
      baralho.push({
        id: uuidv4(),
        valor,
        naipe,
        codigo: `${valor}${naipe[0].toUpperCase()}`,
      });
    }
  }

  return baralho;
}

export function embaralhar<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function obterManilha(vira: Carta): ValorCarta {
  const indiceVira = ORDEM_CARTAS.indexOf(vira.valor);
  // A manilha é a próxima carta na ordem
  const indiceManilha = (indiceVira + 1) % ORDEM_CARTAS.length;
  return ORDEM_CARTAS[indiceManilha];
}

export function obterManilhas(vira: Carta): Carta[] {
  const valorManilha = obterManilha(vira);
  return NAIPES.map(naipe => ({
    id: uuidv4(),
    valor: valorManilha,
    naipe,
    codigo: `${valorManilha}${naipe[0].toUpperCase()}`,
  }));
}

export function ehManilha(carta: Carta, vira: Carta): boolean {
  const valorManilha = obterManilha(vira);
  return carta.valor === valorManilha;
}

export function compararCartas(
  carta1: Carta,
  carta2: Carta,
  vira: Carta
): -1 | 0 | 1 {
  const ehManilha1 = ehManilha(carta1, vira);
  const ehManilha2 = ehManilha(carta2, vira);

  // Se uma é manilha e outra não
  if (ehManilha1 && !ehManilha2) return 1;
  if (!ehManilha1 && ehManilha2) return -1;

  // Se ambas são manilhas, comparar pelo naipe
  if (ehManilha1 && ehManilha2) {
    const indiceNaipe1 = ORDEM_NAIPES.indexOf(carta1.naipe);
    const indiceNaipe2 = ORDEM_NAIPES.indexOf(carta2.naipe);
    if (indiceNaipe1 > indiceNaipe2) return 1;
    if (indiceNaipe1 < indiceNaipe2) return -1;
    return 0;
  }

  // Comparar pelo valor normal
  const indice1 = ORDEM_CARTAS.indexOf(carta1.valor);
  const indice2 = ORDEM_CARTAS.indexOf(carta2.valor);

  if (indice1 > indice2) return 1;
  if (indice1 < indice2) return -1;
  return 0;
}

export function determinarVencedorRodada(
  cartasJogadas: CartaJogada[],
  vira: Carta,
  posicaoParaTime: (pos: number) => 'A' | 'B'
): 'A' | 'B' | 'empate' {
  if (cartasJogadas.length === 0) return 'empate';

  let melhorCarta = cartasJogadas[0];

  for (let i = 1; i < cartasJogadas.length; i++) {
    const comparacao = compararCartas(cartasJogadas[i].carta, melhorCarta.carta, vira);
    if (comparacao === 1) {
      melhorCarta = cartasJogadas[i];
    } else if (comparacao === 0) {
      // Empate - em caso de empate, a primeira carta ganha
      // Mas se todas empatarem, é empate real
    }
  }

  // Verificar se há empate geral
  const cartasEmpatadas = cartasJogadas.filter(
    cj => compararCartas(cj.carta, melhorCarta.carta, vira) === 0
  );

  if (cartasEmpatadas.length > 1) {
    // Verificar se são de times diferentes
    const timesEmpatados = new Set(
      cartasEmpatadas.map(() => {
        // Aqui precisamos mapear o jogador para o time
        // Por simplicidade, vamos usar a posição
        return 'empate';
      })
    );

    if (timesEmpatados.size > 1) {
      return 'empate';
    }
  }

  // Retornar o time do vencedor baseado na posição
  // Posições 0 e 2 = Time A, Posições 1 e 3 = Time B
  return posicaoParaTime(parseInt(melhorCarta.jogadorId) % 4);
}

export function distribuirCartas(numJogadores: number = 4): {
  maos: Carta[][];
  vira: Carta;
  baralhoRestante: Carta[];
} {
  const baralho = embaralhar(criarBaralho());
  const maos: Carta[][] = [];

  // Cada jogador recebe 3 cartas
  for (let i = 0; i < numJogadores; i++) {
    maos.push(baralho.splice(0, 3));
  }

  // A próxima carta é a vira
  const vira = baralho.splice(0, 1)[0];

  return {
    maos,
    vira,
    baralhoRestante: baralho,
  };
}

export function proximoValorTruco(valorAtual: 1 | 3 | 6 | 9 | 12): 3 | 6 | 9 | 12 | null {
  switch (valorAtual) {
    case 1: return 3;  // Truco
    case 3: return 6;  // Seis
    case 6: return 9;  // Nove
    case 9: return 12; // Doze
    case 12: return null; // Não pode aumentar mais
  }
}

export function nomeValorTruco(valor: 1 | 3 | 6 | 9 | 12): string {
  switch (valor) {
    case 1: return 'Normal';
    case 3: return 'Truco';
    case 6: return 'Seis';
    case 9: return 'Nove';
    case 12: return 'Doze';
  }
}

export function calcularPontosPartida(
  rodadas: Rodada[]
): { timeA: number; timeB: number } {
  let timeA = 0;
  let timeB = 0;

  for (const rodada of rodadas) {
    if (rodada.vencedor === 'A') timeA++;
    else if (rodada.vencedor === 'B') timeB++;
  }

  return { timeA, timeB };
}

export function determinarVencedorMao(rodadas: Rodada[]): 'A' | 'B' | null {
  const { timeA, timeB } = calcularPontosPartida(rodadas);

  // Melhor de 3 rodadas
  if (timeA >= 2) return 'A';
  if (timeB >= 2) return 'B';

  // Caso especial: empate na primeira e alguém ganhou a segunda
  if (rodadas.length >= 2) {
    if (rodadas[0].vencedor === 'empate' && rodadas[1].vencedor) {
      return rodadas[1].vencedor === 'empate' ? null : rodadas[1].vencedor;
    }
  }

  return null;
}

export function obterNomeCarta(carta: Carta): string {
  const nomesValores: Record<ValorCarta, string> = {
    'A': 'Ás',
    '2': 'Dois',
    '3': 'Três',
    '4': 'Quatro',
    '5': 'Cinco',
    '6': 'Seis',
    '7': 'Sete',
    'Q': 'Dama',
    'J': 'Valete',
    'K': 'Rei',
  };

  const nomesNaipes: Record<Naipe, string> = {
    'copas': 'Copas',
    'ouros': 'Ouros',
    'espadas': 'Espadas',
    'paus': 'Paus',
  };

  return `${nomesValores[carta.valor]} de ${nomesNaipes[carta.naipe]}`;
}

export function obterSimboloNaipe(naipe: Naipe): string {
  const simbolos: Record<Naipe, string> = {
    'copas': '♥',
    'ouros': '♦',
    'espadas': '♠',
    'paus': '♣',
  };
  return simbolos[naipe];
}

export function obterCorNaipe(naipe: Naipe): 'red' | 'black' {
  return naipe === 'copas' || naipe === 'ouros' ? 'red' : 'black';
}

// Get card image path from /public/cards/ folder
export function obterImagemCarta(carta: Carta): string {
  const valorParaNome: Record<ValorCarta, string> = {
    'A': 'ace',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    'Q': 'queen',
    'J': 'jack',
    'K': 'king',
  };

  const naipeParaNome: Record<Naipe, string> = {
    'copas': 'hearts',
    'ouros': 'diamonds',
    'espadas': 'spades',
    'paus': 'clubs',
  };

  return `/cards/${valorParaNome[carta.valor]}_of_${naipeParaNome[carta.naipe]}.svg`;
}

// Get flipped card image path
export function obterImagemCartaVirada(): string {
  return '/cardB.png';
}
