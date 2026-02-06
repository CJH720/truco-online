// Server-side Truco game logic (CommonJS for Node.js)

const NAIPES = ['ouros', 'espadas', 'copas', 'paus'];
const VALORES = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];

// Hierarchy of card values (higher index = stronger)
const HIERARQUIA = {
  '4': 0,
  '5': 1,
  '6': 2,
  '7': 3,
  'Q': 4,
  'J': 5,
  'K': 6,
  'A': 7,
  '2': 8,
  '3': 9,
};

// Manilha hierarchy (clubs > hearts > spades > diamonds)
const HIERARQUIA_MANILHA = {
  ouros: 0,
  espadas: 1,
  copas: 2,
  paus: 3,
};

function criarBaralho() {
  const baralho = [];
  let id = 0;

  for (const naipe of NAIPES) {
    for (const valor of VALORES) {
      baralho.push({
        id: `card-${id++}`,
        valor,
        naipe,
        codigo: `${valor}${naipe[0].toUpperCase()}`,
      });
    }
  }

  return baralho;
}

function embaralhar(baralho) {
  const embaralhado = [...baralho];

  for (let i = embaralhado.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [embaralhado[i], embaralhado[j]] = [embaralhado[j], embaralhado[i]];
  }

  return embaralhado;
}

function getProximoValor(valor) {
  const index = VALORES.indexOf(valor);
  return VALORES[(index + 1) % VALORES.length];
}

function isManilha(carta, vira) {
  const valorManilha = getProximoValor(vira.valor);
  return carta.valor === valorManilha;
}

function getForcaCarta(carta, vira) {
  if (isManilha(carta, vira)) {
    // Manilhas are stronger than all regular cards (10-13)
    return 10 + HIERARQUIA_MANILHA[carta.naipe];
  }
  return HIERARQUIA[carta.valor];
}

function compararCartas(carta1, carta2, vira) {
  const forca1 = getForcaCarta(carta1, vira);
  const forca2 = getForcaCarta(carta2, vira);

  if (forca1 > forca2) return 1;
  if (forca1 < forca2) return -1;
  return 0; // Empate
}

function distribuirCartas(numJogadores) {
  const baralho = embaralhar(criarBaralho());

  // First card is the "vira" (determines manilha)
  const vira = baralho[0];

  // Each player gets 3 cards
  const maos = [];
  let cardIndex = 1;

  for (let i = 0; i < numJogadores; i++) {
    maos.push(baralho.slice(cardIndex, cardIndex + 3));
    cardIndex += 3;
  }

  return { maos, vira };
}

function determinarVencedorRodada(rodada, vira) {
  if (rodada.cartasJogadas.length !== 4) return null;

  let melhorCarta = rodada.cartasJogadas[0];

  for (let i = 1; i < rodada.cartasJogadas.length; i++) {
    const comparacao = compararCartas(
      rodada.cartasJogadas[i].carta,
      melhorCarta.carta,
      vira
    );

    if (comparacao > 0) {
      melhorCarta = rodada.cartasJogadas[i];
    }
  }

  // Find player position to determine team
  // In a 4-player game: positions 0,2 = Team A, positions 1,3 = Team B
  // We need to track position, but for now we'll use a simple approach
  // The caller should pass position info or we check based on order

  // For now, return the winning jogadorId
  // The server.js will determine the team based on position
  return melhorCarta;
}

function determinarVencedorMao(rodadas) {
  const vitoriasA = rodadas.filter((r) => r.vencedor === 'A').length;
  const vitoriasB = rodadas.filter((r) => r.vencedor === 'B').length;

  // Best of 3
  if (vitoriasA >= 2) return 'A';
  if (vitoriasB >= 2) return 'B';

  // Special rule: first round tie, winner of second round wins
  if (rodadas.length >= 2 && rodadas[0].vencedor === 'empate') {
    if (rodadas[1].vencedor && rodadas[1].vencedor !== 'empate') {
      return rodadas[1].vencedor;
    }
  }

  // If 3 rounds and still no winner (all ties), first to play wins
  if (rodadas.length === 3) {
    // This is rare - team that played first card in first round wins
    return 'A'; // Default to A if all tied
  }

  return null; // Hand continues
}

function proximoValorTruco(valorAtual) {
  const valores = [1, 3, 6, 9, 12];
  const index = valores.indexOf(valorAtual);
  if (index >= valores.length - 1) return null;
  return valores[index + 1];
}

module.exports = {
  criarBaralho,
  embaralhar,
  distribuirCartas,
  compararCartas,
  isManilha,
  getForcaCarta,
  determinarVencedorRodada,
  determinarVencedorMao,
  proximoValorTruco,
  NAIPES,
  VALORES,
};
