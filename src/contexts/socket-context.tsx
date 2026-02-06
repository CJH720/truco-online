'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { useAuthStore } from '@/stores/auth-store';
import { Sala, Jogador, MensagemChat } from '@/types/game';
import { toast } from 'sonner';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  rooms: Sala[];
  currentRoom: Sala | null;
  gameState: GameState | null;
  messages: MensagemChat[];

  // Room actions
  createRoom: (room: Omit<Sala, 'id' | 'codigo' | 'jogadores' | 'criadoEm'>) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  refreshRooms: () => void;

  // Game actions
  startGame: () => void;
  playCard: (card: { id: string; valor: string; naipe: string; codigo: string }) => void;
  callTruco: () => void;
  respondTruco: (aceitar: boolean) => void;

  // Chat
  sendMessage: (message: string) => void;
}

interface GameState {
  partidaId: string;
  times: {
    A: { id: string; jogadores: string[]; pontos: number };
    B: { id: string; jogadores: string[]; pontos: number };
  };
  jogadores: Jogador[];
  maoAtual: {
    numero: number;
    vira: { id: string; valor: string; naipe: string; codigo: string };
    rodadas: Array<{
      numero: number;
      cartasJogadas: Array<{
        jogadorId: string;
        carta: { id: string; valor: string; naipe: string; codigo: string };
        timestamp: number;
      }>;
      vencedor?: 'A' | 'B' | 'empate';
    }>;
    valorAposta: number;
    timeQuePediu?: 'A' | 'B';
    valorPedido?: number;
  };
  minhasCartas: Array<{ id: string; valor: string; naipe: string; codigo: string }>;
  jogadorDaVez: string;
  status: 'em_andamento' | 'truco_pedido' | 'finalizada';
  vencedor?: 'A' | 'B';
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [rooms, setRooms] = useState<Sala[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Sala | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [messages, setMessages] = useState<MensagemChat[]>([]);

  // Ref to track current room ID for use in event handlers
  const currentRoomIdRef = useRef<string | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    currentRoomIdRef.current = currentRoom?.id || null;
  }, [currentRoom?.id]);

  // Connect socket when user is authenticated
  useEffect(() => {
    if (usuario) {
      const s = connectSocket(usuario.id, usuario.nome, usuario.avatar);
      setSocket(s);

      s.on('connect', () => {
        setIsConnected(true);
        s.emit('get-rooms');
      });

      s.on('disconnect', () => {
        setIsConnected(false);
      });

      // Room events
      s.on('rooms-list', (roomsList: Sala[]) => {
        setRooms(roomsList);
      });

      s.on('rooms-updated', (roomsList: Sala[]) => {
        setRooms(roomsList);
      });

      s.on('room-created', (room: Sala) => {
        setRooms((prev) => [...prev.filter((r) => r.id !== room.id), room]);
      });

      s.on('room-deleted', (roomId: string) => {
        setRooms((prev) => prev.filter((r) => r.id !== roomId));
        if (currentRoomIdRef.current === roomId) {
          setCurrentRoom(null);
          setGameState(null);
        }
      });

      s.on('player-joined', ({ player, room }: { player: Jogador; room: Sala }) => {
        setCurrentRoom(room);
        toast.success(`${player.nome} entrou na sala!`);
      });

      s.on('player-left', ({ playerId, room }: { playerId: string; room: Sala }) => {
        setCurrentRoom(room);
        const player = room.jogadores.find((j) => j.id === playerId);
        if (player) {
          toast.info(`${player.nome} saiu da sala`);
        }
      });

      s.on('player-disconnected', ({ playerName }: { playerId: string; playerName: string }) => {
        toast.warning(`${playerName} desconectou`);
      });

      s.on('player-reconnected', ({ playerId, room }: { playerId: string; room: Sala }) => {
        setCurrentRoom(room);
        const player = room.jogadores.find((j) => j.id === playerId);
        if (player) {
          toast.success(`${player.nome} reconectou!`);
        }
      });

      // Game events
      s.on('game-started', (state: GameState) => {
        setGameState(state);
        toast.success('Partida iniciada!');
      });

      s.on('card-played', (data: {
        playerId: string;
        card: { id: string; valor: string; naipe: string; codigo: string };
        jogadorDaVez: string;
        rodadaAtual: GameState['maoAtual']['rodadas'][0];
        times: GameState['times'];
      }) => {
        setGameState((prev) => {
          if (!prev) return null;
          const updatedRodadas = [...prev.maoAtual.rodadas];
          updatedRodadas[updatedRodadas.length - 1] = data.rodadaAtual;

          return {
            ...prev,
            jogadorDaVez: data.jogadorDaVez,
            maoAtual: {
              ...prev.maoAtual,
              rodadas: updatedRodadas,
            },
            times: data.times,
          };
        });
      });

      s.on('new-hand', (data: {
        maoAtual: GameState['maoAtual'];
        minhasCartas: GameState['minhasCartas'];
        times: GameState['times'];
      }) => {
        setGameState((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            maoAtual: data.maoAtual,
            minhasCartas: data.minhasCartas,
            times: data.times,
            status: 'em_andamento',
          };
        });
        toast.info('Nova mão!');
      });

      s.on('truco-called', (data: {
        playerId: string;
        playerName: string;
        timeQuePediu: 'A' | 'B';
        valorPedido: number;
        valorAtual: number;
      }) => {
        setGameState((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: 'truco_pedido',
            maoAtual: {
              ...prev.maoAtual,
              timeQuePediu: data.timeQuePediu,
              valorPedido: data.valorPedido,
            },
          };
        });
        toast.warning(`${data.playerName} pediu TRUCO! (${data.valorPedido} pontos)`);
      });

      s.on('truco-accepted', ({ novoValor }: { novoValor: number }) => {
        setGameState((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: 'em_andamento',
            maoAtual: {
              ...prev.maoAtual,
              valorAposta: novoValor,
              timeQuePediu: undefined,
              valorPedido: undefined,
            },
          };
        });
        toast.success(`Truco aceito! Vale ${novoValor} pontos`);
      });

      s.on('truco-declined', (data: {
        timeVencedor: 'A' | 'B';
        times: GameState['times'];
        maoAtual: GameState['maoAtual'];
        minhasCartas: GameState['minhasCartas'];
      }) => {
        setGameState((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: 'em_andamento',
            maoAtual: data.maoAtual,
            minhasCartas: data.minhasCartas,
            times: data.times,
          };
        });
        toast.info(`Truco recusado! Time ${data.timeVencedor} ganhou a mão`);
      });

      s.on('game-over', (data: {
        vencedor: 'A' | 'B';
        times: GameState['times'];
        motivo?: string;
      }) => {
        setGameState((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: 'finalizada',
            vencedor: data.vencedor,
            times: data.times,
          };
        });
        toast.success(`Time ${data.vencedor} venceu! ${data.motivo || ''}`);
      });

      // Chat events
      s.on('chat-message', (message: MensagemChat) => {
        setMessages((prev) => [...prev, message]);
      });

      // Error handling
      s.on('error', ({ message }: { message: string }) => {
        toast.error(message);
      });

      return () => {
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [usuario]);

  // Room actions
  const createRoom = useCallback(
    (roomData: Omit<Sala, 'id' | 'codigo' | 'jogadores' | 'criadoEm'>) => {
      if (!socket || !usuario) return;

      const room = {
        ...roomData,
        id: `room-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        codigo: Math.random().toString(36).substring(2, 8).toUpperCase(),
        jogadores: [],
        criadoEm: new Date(),
      };

      socket.emit('create-room', { room, user: usuario });
      setCurrentRoom({
        ...room,
        jogadores: [{
          id: usuario.id,
          nome: usuario.nome,
          avatar: usuario.avatar,
          fichas: usuario.fichas,
          posicao: 0,
          cartas: [],
          online: true,
        }],
      } as Sala);
      setMessages([]);
    },
    [socket, usuario]
  );

  const joinRoom = useCallback(
    (roomId: string) => {
      if (!socket || !usuario) return;
      socket.emit('join-room', { roomId, user: usuario });
      const room = rooms.find((r) => r.id === roomId);
      if (room) {
        setCurrentRoom(room);
        setMessages([]);
      }
    },
    [socket, usuario, rooms]
  );

  const leaveRoom = useCallback(() => {
    if (!socket || !usuario || !currentRoom) return;
    socket.emit('leave-room', { roomId: currentRoom.id, userId: usuario.id });
    setCurrentRoom(null);
    setGameState(null);
    setMessages([]);
  }, [socket, usuario, currentRoom]);

  const refreshRooms = useCallback(() => {
    if (!socket) return;
    socket.emit('get-rooms');
  }, [socket]);

  // Game actions
  const startGame = useCallback(() => {
    if (!socket || !currentRoom) return;
    socket.emit('start-game', { roomId: currentRoom.id });
  }, [socket, currentRoom]);

  const playCard = useCallback(
    (card: { id: string; valor: string; naipe: string; codigo: string }) => {
      if (!socket || !currentRoom || !usuario) return;
      socket.emit('play-card', {
        roomId: currentRoom.id,
        playerId: usuario.id,
        card,
      });

      // Optimistically remove card from hand
      setGameState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          minhasCartas: prev.minhasCartas.filter((c) => c.id !== card.id),
        };
      });
    },
    [socket, currentRoom, usuario]
  );

  const callTruco = useCallback(() => {
    if (!socket || !currentRoom || !usuario) return;
    socket.emit('call-truco', {
      roomId: currentRoom.id,
      playerId: usuario.id,
    });
  }, [socket, currentRoom, usuario]);

  const respondTruco = useCallback(
    (aceitar: boolean) => {
      if (!socket || !currentRoom || !usuario) return;
      socket.emit('respond-truco', {
        roomId: currentRoom.id,
        aceitar,
        playerId: usuario.id,
      });
    },
    [socket, currentRoom, usuario]
  );

  // Chat
  const sendMessage = useCallback(
    (message: string) => {
      if (!socket || !currentRoom || !usuario) return;
      socket.emit('chat-message', {
        roomId: currentRoom.id,
        message,
        user: usuario,
      });
    },
    [socket, currentRoom, usuario]
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        rooms,
        currentRoom,
        gameState,
        messages,
        createRoom,
        joinRoom,
        leaveRoom,
        refreshRooms,
        startGame,
        playCard,
        callTruco,
        respondTruco,
        sendMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
