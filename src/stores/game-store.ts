// Store global do jogo usando Zustand

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Carta,
  Jogador,
  Partida,
  Sala,
  Usuario,
  MensagemChat,
} from '@/types/game';
import {
  distribuirCartas,
  determinarVencedorMao,
  proximoValorTruco,
  compararCartas,
} from '@/lib/truco-logic';
import { v4 as uuidv4 } from 'uuid';

interface GameState {
  // Usuário atual
  usuario: Usuario | null;
  setUsuario: (usuario: Usuario | null) => void;

  // Sala atual
  salaAtual: Sala | null;
  setSalaAtual: (sala: Sala | null) => void;
  entrarSala: (sala: Sala, usuarioAtual?: Usuario) => void;
  sairSala: () => void;

  // Partida atual
  partidaAtual: Partida | null;
  setPartidaAtual: (partida: Partida | null) => void;
  iniciarPartida: () => void;
  jogarCarta: (jogadorId: string, carta: Carta) => void;
  pedirTruco: (jogadorId: string) => void;
  responderTruco: (aceitar: boolean, timeId: 'A' | 'B') => void;

  // Chat
  mensagensChat: MensagemChat[];
  enviarMensagem: (conteudo: string, tipo?: 'mensagem' | 'emoji' | 'sistema') => void;
  limparChat: () => void;

  // Audio
  somAtivo: boolean;
  toggleSom: () => void;

  // Salas disponíveis
  salasDisponiveis: Sala[];
  setSalasDisponiveis: (salas: Sala[]) => void;
  criarSala: (nome: string, aposta: number, privada: boolean, variante: 'paulista' | 'mineiro' | 'gaucho', usuarioAtual?: Usuario) => Sala;

  // Ranking
  ranking: Usuario[];
  setRanking: (ranking: Usuario[]) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Usuário
      usuario: null,
      setUsuario: (usuario) => set({ usuario }),

      // Sala
      salaAtual: null,
      setSalaAtual: (sala) => set({ salaAtual: sala }),

      entrarSala: (sala, usuarioAtual) => {
        const usuario = usuarioAtual || get().usuario;
        if (!usuario) return;

        const novoJogador: Jogador = {
          id: usuario.id,
          nome: usuario.nome,
          avatar: usuario.avatar,
          fichas: usuario.fichas,
          posicao: sala.jogadores.length as 0 | 1 | 2 | 3,
          cartas: [],
          online: true,
        };

        const salaAtualizada = {
          ...sala,
          jogadores: [...sala.jogadores, novoJogador],
          status: sala.jogadores.length + 1 >= 4 ? 'cheia' as const : 'aguardando' as const,
        };

        set({ salaAtual: salaAtualizada });
      },

      sairSala: () => {
        set({ salaAtual: null, partidaAtual: null, mensagensChat: [] });
      },

      // Partida
      partidaAtual: null,
      setPartidaAtual: (partida) => set({ partidaAtual: partida }),

      iniciarPartida: () => {
        const { salaAtual } = get();
        if (!salaAtual || salaAtual.jogadores.length < 4) return;

        const { maos, vira } = distribuirCartas(4);

        const jogadoresComCartas = salaAtual.jogadores.map((jogador, index) => ({
          ...jogador,
          cartas: maos[index],
        }));

        const partida: Partida = {
          id: uuidv4(),
          sala: salaAtual.id,
          times: {
            A: {
              id: 'A',
              jogadores: [jogadoresComCartas[0].id, jogadoresComCartas[2].id],
              pontos: 0,
              pontosRodada: 0,
            },
            B: {
              id: 'B',
              jogadores: [jogadoresComCartas[1].id, jogadoresComCartas[3].id],
              pontos: 0,
              pontosRodada: 0,
            },
          },
          jogadores: jogadoresComCartas,
          maoAtual: {
            numero: 1,
            vira,
            manilhas: [],
            rodadas: [
              {
                numero: 1,
                cartasJogadas: [],
                manilha: vira,
              },
            ],
            valorAposta: 1,
          },
          historico: [],
          jogadorDaVez: jogadoresComCartas[0].id,
          status: 'em_andamento',
          criadoEm: new Date(),
          variante: salaAtual.variante,
        };

        set({
          partidaAtual: partida,
          salaAtual: { ...salaAtual, status: 'jogando' },
        });
      },

      jogarCarta: (jogadorId, carta) => {
        const { partidaAtual } = get();
        if (!partidaAtual || partidaAtual.status !== 'em_andamento') return;
        if (partidaAtual.jogadorDaVez !== jogadorId) return;

        const jogador = partidaAtual.jogadores.find(j => j.id === jogadorId);
        if (!jogador) return;

        // Remove a carta da mão do jogador
        const cartasRestantes = jogador.cartas.filter(c => c.id !== carta.id);

        // Adiciona a carta jogada na rodada atual
        const maoAtual = partidaAtual.maoAtual!;
        const rodadaAtual = maoAtual.rodadas[maoAtual.rodadas.length - 1];

        rodadaAtual.cartasJogadas.push({
          jogadorId,
          carta,
          timestamp: Date.now(),
        });

        // Atualiza o jogador
        const jogadoresAtualizados = partidaAtual.jogadores.map(j =>
          j.id === jogadorId ? { ...j, cartas: cartasRestantes } : j
        );

        // Determina o próximo jogador
        const indiceAtual = partidaAtual.jogadores.findIndex(j => j.id === jogadorId);
        const proximoIndice = (indiceAtual + 1) % 4;
        const proximoJogador = partidaAtual.jogadores[proximoIndice].id;

        // Verifica se a rodada terminou (4 cartas jogadas)
        let novaPartida = { ...partidaAtual };

        if (rodadaAtual.cartasJogadas.length === 4) {
          // Determinar vencedor da rodada
          let melhorCarta = rodadaAtual.cartasJogadas[0];
          for (const cj of rodadaAtual.cartasJogadas) {
            if (compararCartas(cj.carta, melhorCarta.carta, maoAtual.vira) === 1) {
              melhorCarta = cj;
            }
          }

          const jogadorVencedor = partidaAtual.jogadores.find(j => j.id === melhorCarta.jogadorId);
          const timeVencedor = jogadorVencedor!.posicao % 2 === 0 ? 'A' : 'B';

          rodadaAtual.vencedor = timeVencedor as 'A' | 'B';

          // Verificar se a mão terminou
          const vencedorMao = determinarVencedorMao(maoAtual.rodadas);

          if (vencedorMao) {
            // Atualizar pontos
            novaPartida.times[vencedorMao].pontos += maoAtual.valorAposta;
            maoAtual.vencedor = vencedorMao;

            // Verificar se a partida terminou (12 pontos)
            if (novaPartida.times[vencedorMao].pontos >= 12) {
              novaPartida.status = 'finalizada';
              novaPartida.vencedor = vencedorMao;
            } else {
              // Nova mão
              const { maos, vira } = distribuirCartas(4);
              const novosJogadores = jogadoresAtualizados.map((j, i) => ({
                ...j,
                cartas: maos[i],
              }));

              novaPartida = {
                ...novaPartida,
                jogadores: novosJogadores,
                maoAtual: {
                  numero: (maoAtual.numero + 1) as number,
                  vira,
                  manilhas: [],
                  rodadas: [{ numero: 1, cartasJogadas: [], manilha: vira }],
                  valorAposta: 1,
                },
                historico: [...novaPartida.historico, maoAtual],
                jogadorDaVez: novosJogadores[0].id,
              };
            }
          } else if (maoAtual.rodadas.length < 3) {
            // Nova rodada
            maoAtual.rodadas.push({
              numero: (maoAtual.rodadas.length + 1) as 1 | 2 | 3,
              cartasJogadas: [],
              manilha: maoAtual.vira,
            });

            // O vencedor da rodada começa
            novaPartida.jogadorDaVez = melhorCarta.jogadorId;
          }
        } else {
          novaPartida.jogadorDaVez = proximoJogador;
        }

        novaPartida.jogadores = jogadoresAtualizados;
        novaPartida.maoAtual = maoAtual;

        set({ partidaAtual: novaPartida });
      },

      pedirTruco: (jogadorId) => {
        const { partidaAtual } = get();
        if (!partidaAtual || partidaAtual.status !== 'em_andamento') return;

        const jogador = partidaAtual.jogadores.find(j => j.id === jogadorId);
        if (!jogador) return;

        const maoAtual = partidaAtual.maoAtual!;
        const proximoValor = proximoValorTruco(maoAtual.valorAposta);

        if (!proximoValor) return; // Já está no máximo

        const timeDoJogador = jogador.posicao % 2 === 0 ? 'A' : 'B';

        set({
          partidaAtual: {
            ...partidaAtual,
            status: 'truco_pedido',
            maoAtual: {
              ...maoAtual,
              timeQuePediu: timeDoJogador,
            },
          },
        });
      },

      responderTruco: (aceitar, _timeId) => {
        const { partidaAtual } = get();
        if (!partidaAtual || partidaAtual.status !== 'truco_pedido') return;

        const maoAtual = partidaAtual.maoAtual!;

        if (aceitar) {
          const proximoValor = proximoValorTruco(maoAtual.valorAposta);
          set({
            partidaAtual: {
              ...partidaAtual,
              status: 'em_andamento',
              maoAtual: {
                ...maoAtual,
                valorAposta: proximoValor!,
                timeQuePediu: undefined,
              },
            },
          });
        } else {
          // Time que pediu ganha a mão com o valor anterior
          const timePediu = maoAtual.timeQuePediu!;
          const novaPartida = { ...partidaAtual };
          novaPartida.times[timePediu].pontos += maoAtual.valorAposta;

          if (novaPartida.times[timePediu].pontos >= 12) {
            novaPartida.status = 'finalizada';
            novaPartida.vencedor = timePediu;
          } else {
            // Nova mão
            const { maos, vira } = distribuirCartas(4);
            const novosJogadores = partidaAtual.jogadores.map((j, i) => ({
              ...j,
              cartas: maos[i],
            }));

            novaPartida.jogadores = novosJogadores;
            novaPartida.maoAtual = {
              numero: maoAtual.numero + 1,
              vira,
              manilhas: [],
              rodadas: [{ numero: 1, cartasJogadas: [], manilha: vira }],
              valorAposta: 1,
            };
            novaPartida.historico = [...novaPartida.historico, maoAtual];
            novaPartida.status = 'em_andamento';
            novaPartida.jogadorDaVez = novosJogadores[0].id;
          }

          set({ partidaAtual: novaPartida });
        }
      },

      // Chat
      mensagensChat: [],
      enviarMensagem: (conteudo, tipo = 'mensagem') => {
        const { usuario, mensagensChat } = get();
        if (!usuario) return;

        const novaMensagem: MensagemChat = {
          id: uuidv4(),
          jogadorId: usuario.id,
          jogadorNome: usuario.nome,
          conteudo,
          timestamp: new Date(),
          tipo,
        };

        set({ mensagensChat: [...mensagensChat, novaMensagem] });
      },
      limparChat: () => set({ mensagensChat: [] }),

      // Som
      somAtivo: true,
      toggleSom: () => set((state) => ({ somAtivo: !state.somAtivo })),

      // Salas
      salasDisponiveis: [],
      setSalasDisponiveis: (salas) => set({ salasDisponiveis: salas }),

      criarSala: (nome, aposta, privada, variante, usuarioAtual) => {
        const usuario = usuarioAtual || get().usuario;
        if (!usuario) throw new Error('Usuário não autenticado');

        const novaSala: Sala = {
          id: uuidv4(),
          nome,
          codigo: Math.random().toString(36).substring(2, 8).toUpperCase(),
          criador: usuario.id,
          jogadores: [{
            id: usuario.id,
            nome: usuario.nome,
            avatar: usuario.avatar,
            fichas: usuario.fichas,
            posicao: 0,
            cartas: [],
            online: true,
          }],
          maxJogadores: 4,
          aposta,
          status: 'aguardando',
          privada,
          variante,
          criadoEm: new Date(),
        };

        set((state) => ({
          salasDisponiveis: [...state.salasDisponiveis, novaSala],
          salaAtual: novaSala,
        }));

        return novaSala;
      },

      // Ranking
      ranking: [],
      setRanking: (ranking) => set({ ranking }),
    }),
    {
      name: 'truco-storage',
      partialize: (state) => ({
        usuario: state.usuario,
        somAtivo: state.somAtivo,
      }),
    }
  )
);
