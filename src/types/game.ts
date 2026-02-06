// Tipos do jogo de Truco

export type Naipe = 'copas' | 'ouros' | 'espadas' | 'paus';

export type ValorCarta = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | 'Q' | 'J' | 'K';

export interface Carta {
  id: string;
  valor: ValorCarta;
  naipe: Naipe;
  codigo: string; // Para identificação única, ex: "4P" = 4 de Paus
}

export interface Jogador {
  id: string;
  nome: string;
  avatar?: string;
  fichas: number;
  posicao: 0 | 1 | 2 | 3; // Posição na mesa (0 e 2 = time A, 1 e 3 = time B)
  cartas: Carta[];
  online: boolean;
}

export interface Time {
  id: 'A' | 'B';
  jogadores: string[]; // IDs dos jogadores
  pontos: number; // Pontos da partida (0-12)
  pontosRodada: number; // Pontos da rodada atual
}

export interface CartaJogada {
  jogadorId: string;
  carta: Carta;
  timestamp: number;
}

export interface Rodada {
  numero: 1 | 2 | 3;
  cartasJogadas: CartaJogada[];
  vencedor?: 'A' | 'B' | 'empate';
  manilha: Carta;
}

export interface Mao {
  numero: number;
  vira: Carta; // Carta que define a manilha
  manilhas: Carta[]; // As 4 manilhas da mão
  rodadas: Rodada[];
  valorAposta: 1 | 3 | 6 | 9 | 12; // Valor atual (normal, truco, seis, nove, doze)
  timeQuePediu?: 'A' | 'B';
  vencedor?: 'A' | 'B';
}

export type StatusPartida =
  | 'aguardando'
  | 'iniciando'
  | 'em_andamento'
  | 'truco_pedido'
  | 'finalizada';

export interface Partida {
  id: string;
  sala: string;
  times: {
    A: Time;
    B: Time;
  };
  jogadores: Jogador[];
  maoAtual?: Mao;
  historico: Mao[];
  jogadorDaVez: string;
  status: StatusPartida;
  vencedor?: 'A' | 'B';
  criadoEm: Date;
  variante: 'paulista' | 'mineiro' | 'gaucho';
}

export interface Sala {
  id: string;
  nome: string;
  codigo: string; // Código para convite
  criador: string;
  jogadores: Jogador[];
  maxJogadores: 4;
  aposta: number; // Fichas apostadas
  status: 'aguardando' | 'cheia' | 'jogando';
  privada: boolean;
  variante: 'paulista' | 'mineiro' | 'gaucho';
  criadoEm: Date;
}

export interface MensagemChat {
  id: string;
  jogadorId: string;
  jogadorNome: string;
  conteudo: string;
  timestamp: Date;
  tipo: 'mensagem' | 'sistema' | 'emoji';
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  avatar?: string;
  fichas: number;
  nivel: number;
  experiencia: number;
  vitorias: number;
  derrotas: number;
  partidasJogadas: number;
  criadoEm: Date;
}

export interface RankingJogador {
  posicao: number;
  usuario: Usuario;
  pontuacao: number;
}

// Eventos do WebSocket
export type EventoJogo =
  | { tipo: 'jogador_entrou'; jogador: Jogador }
  | { tipo: 'jogador_saiu'; jogadorId: string }
  | { tipo: 'partida_iniciada'; partida: Partida }
  | { tipo: 'carta_jogada'; jogadorId: string; carta: Carta }
  | { tipo: 'truco_pedido'; jogadorId: string; valor: number }
  | { tipo: 'truco_aceito'; timeId: 'A' | 'B' }
  | { tipo: 'truco_recusado'; timeId: 'A' | 'B' }
  | { tipo: 'rodada_finalizada'; rodada: Rodada }
  | { tipo: 'mao_finalizada'; mao: Mao }
  | { tipo: 'partida_finalizada'; partida: Partida }
  | { tipo: 'mensagem_chat'; mensagem: MensagemChat }
  | { tipo: 'vez_de_jogar'; jogadorId: string };
