'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/stores/auth-store';
import { useGameStore } from '@/stores/game-store';
import { useSocket } from '@/contexts/socket-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BotoesAcao } from '@/components/game/botoes-acao';
import { ChatJogo } from '@/components/chat/chat-jogo';
import { Carta, Partida, CartaJogada } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Trophy,
  Users,
  Coins,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { TrucoEffects, GameEndEffects } from '@/components/game/truco-effects';

// Importar Mesa3D dinamicamente para evitar SSR
const Mesa3D = dynamic(
  () => import('@/components/game/mesa-3d').then((mod) => mod.Mesa3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] rounded-xl bg-green-900/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4" />
          <p className="text-white text-lg">Carregando mesa 3D...</p>
        </div>
      </div>
    ),
  }
);

export default function JogoPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;
  const { usuario } = useAuthStore();

  // WebSocket context for real-time gameplay
  const {
    isConnected,
    currentRoom,
    gameState,
    playCard,
    callTruco,
    respondTruco,
    sendMessage,
    leaveRoom,
  } = useSocket();

  // Fallback to local game store if not using WebSocket
  const {
    partidaAtual: localPartidaAtual,
    salaAtual: localSalaAtual,
    jogarCarta: localJogarCarta,
    pedirTruco: localPedirTruco,
    responderTruco: localResponderTruco,
    enviarMensagem: localEnviarMensagem,
    somAtivo,
    toggleSom,
  } = useGameStore();

  // Convert WebSocket gameState to Partida format
  const partidaAtual: Partida | null = useMemo(() => {
    if (gameState) {
      return {
        id: gameState.partidaId,
        sala: roomId,
        times: {
          A: {
            id: 'A' as const,
            jogadores: gameState.times.A.jogadores,
            pontos: gameState.times.A.pontos,
            pontosRodada: 0,
          },
          B: {
            id: 'B' as const,
            jogadores: gameState.times.B.jogadores,
            pontos: gameState.times.B.pontos,
            pontosRodada: 0,
          },
        },
        jogadores: gameState.jogadores.map((j, idx) => ({
          ...j,
          cartas: (j.id === usuario?.id ? gameState.minhasCartas : []) as Carta[],
          posicao: idx as 0 | 1 | 2 | 3,
          online: true,
        })),
        maoAtual: {
          numero: gameState.maoAtual.numero,
          vira: gameState.maoAtual.vira as Carta,
          manilhas: [],
          rodadas: gameState.maoAtual.rodadas.map((r, idx) => ({
            numero: (idx + 1) as 1 | 2 | 3,
            cartasJogadas: r.cartasJogadas as CartaJogada[],
            vencedor: r.vencedor,
            manilha: gameState.maoAtual.vira as Carta,
          })),
          valorAposta: gameState.maoAtual.valorAposta as 1 | 3 | 6 | 9 | 12,
          timeQuePediu: gameState.maoAtual.timeQuePediu,
        },
        historico: [],
        jogadorDaVez: gameState.jogadorDaVez,
        status: gameState.status,
        vencedor: gameState.vencedor,
        criadoEm: new Date(),
        variante: 'paulista',
      } as Partida;
    }
    return localPartidaAtual;
  }, [gameState, localPartidaAtual, roomId, usuario?.id]);

  const salaAtual = currentRoom || localSalaAtual;

  const [cartaSelecionada, setCartaSelecionada] = useState<Carta | null>(null);
  const [mostrarChat, setMostrarChat] = useState(true);
  const [telaCheia, setTelaCheia] = useState(false);
  const [dialogFim, setDialogFim] = useState(false);
  const [dialogDesistir, setDialogDesistir] = useState(false);

  // Check if using WebSocket
  const isUsingWebSocket = !!gameState;

  // Verificar se a partida terminou
  useEffect(() => {
    if (partidaAtual?.status === 'finalizada') {
      setDialogFim(true);
    }
  }, [partidaAtual?.status]);

  // Redirecionar se não houver partida
  useEffect(() => {
    if (!partidaAtual && !salaAtual && !gameState) {
      router.push('/lobby');
    }
  }, [partidaAtual, salaAtual, gameState, router]);

  if (!partidaAtual || !usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  const handleJogarCarta = (carta: Carta) => {
    if (isUsingWebSocket) {
      playCard(carta);
    } else {
      localJogarCarta(usuario.id, carta);
    }
    setCartaSelecionada(null);

    // Feedback sonoro (placeholder)
    if (somAtivo) {
      // Tocar som de carta
    }
  };

  const handlePedirTruco = () => {
    if (isUsingWebSocket) {
      callTruco();
      sendMessage('pediu TRUCO! 🃏');
    } else {
      localPedirTruco(usuario.id);
      localEnviarMensagem('pediu TRUCO! 🃏', 'sistema');
    }

    if (somAtivo) {
      // Tocar som de truco
    }
  };

  const jogador = partidaAtual.jogadores.find((j) => j.id === usuario.id);
  const timeDoJogador = jogador?.posicao !== undefined ? (jogador.posicao % 2 === 0 ? 'A' : 'B') : null;

  const handleAceitarTruco = () => {
    if (timeDoJogador) {
      if (isUsingWebSocket) {
        respondTruco(true);
        sendMessage('aceitou! 💪');
      } else {
        localResponderTruco(true, timeDoJogador);
        localEnviarMensagem('aceitou! 💪', 'sistema');
      }
    }
  };

  const handleRecusarTruco = () => {
    if (timeDoJogador) {
      if (isUsingWebSocket) {
        respondTruco(false);
        sendMessage('correu! 🏃');
      } else {
        localResponderTruco(false, timeDoJogador);
        localEnviarMensagem('correu! 🏃', 'sistema');
      }
    }
  };

  const handleDesistir = () => {
    setDialogDesistir(true);
  };

  const confirmarDesistencia = () => {
    if (isUsingWebSocket) {
      leaveRoom();
    }
    setDialogDesistir(false);
    router.push('/lobby');
    toast.info('Você saiu da partida');
  };

  const toggleTelaCheia = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setTelaCheia(true);
    } else {
      document.exitFullscreen();
      setTelaCheia(false);
    }
  };

  const voltarParaLobby = () => {
    setDialogFim(false);
    router.push('/lobby');
  };

  const meuTime = timeDoJogador;
  const ganhei = partidaAtual.vencedor === meuTime;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-4">
      {/* Truco visual effects */}
      <TrucoEffects
        valorAposta={partidaAtual.maoAtual?.valorAposta || 1}
        trucoPedido={partidaAtual.status === 'truco_pedido'}
        timeQuePediu={partidaAtual.maoAtual?.timeQuePediu}
      />

      {/* Game end effects */}
      <GameEndEffects
        show={partidaAtual.status === 'finalizada' && !dialogFim}
        isVictory={ganhei}
        timeVencedor={partidaAtual.vencedor || 'A'}
        onComplete={() => setDialogFim(true)}
      />

      {/* Header do jogo */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          onClick={() => setDialogDesistir(true)}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Sair
        </Button>

        <div className="flex items-center gap-2">
          {/* Connection status indicator */}
          {isUsingWebSocket && (
            <Badge className={isConnected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
              {isConnected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
              {isConnected ? 'Online' : 'Offline'}
            </Badge>
          )}
          <Badge className="bg-white/10 text-white">
            <Users className="h-3 w-3 mr-1" />
            {salaAtual?.nome || 'Partida'}
          </Badge>
          <Badge className="bg-yellow-500/20 text-yellow-300">
            <Coins className="h-3 w-3 mr-1" />
            {salaAtual?.aposta || 0} fichas
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSom}
            className="text-white hover:bg-white/10"
          >
            {somAtivo ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTelaCheia}
            className="text-white hover:bg-white/10"
          >
            {telaCheia ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMostrarChat(!mostrarChat)}
            className="text-white hover:bg-white/10 lg:hidden"
          >
            💬
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Mesa 3D */}
        <div className="lg:col-span-3 space-y-4">
          <Mesa3D
            partida={partidaAtual}
            jogadorAtual={usuario.id}
            cartaSelecionada={cartaSelecionada}
            onSelecionarCarta={setCartaSelecionada}
            onJogarCarta={handleJogarCarta}
          />

          {/* Botões de ação */}
          <BotoesAcao
            partida={partidaAtual}
            jogadorAtual={usuario.id}
            onPedirTruco={handlePedirTruco}
            onAceitarTruco={handleAceitarTruco}
            onRecusarTruco={handleRecusarTruco}
            onDesistir={handleDesistir}
          />
        </div>

        {/* Chat lateral */}
        <AnimatePresence>
          {mostrarChat && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="hidden lg:block h-[700px]"
            >
              <ChatJogo />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat mobile */}
      <AnimatePresence>
        {mostrarChat && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 h-[300px] lg:hidden z-50"
          >
            <ChatJogo />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog de fim de partida */}
      <Dialog open={dialogFim} onOpenChange={setDialogFim}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              {ganhei ? '🎉 Vitória!' : '😢 Derrota'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {ganhei
                ? 'Parabéns! Você e seu parceiro venceram a partida!'
                : 'Não foi dessa vez. Tente novamente!'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Time A</p>
                <p className="text-3xl font-bold text-blue-600">
                  {partidaAtual.times.A.pontos}
                </p>
              </div>
              <div className="text-4xl font-bold text-muted-foreground">×</div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Time B</p>
                <p className="text-3xl font-bold text-red-600">
                  {partidaAtual.times.B.pontos}
                </p>
              </div>
            </div>

            {ganhei && (
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-green-700 font-medium">
                  +{(salaAtual?.aposta || 0) * 2} fichas
                </p>
                <p className="text-green-600 text-sm">+50 XP</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={voltarParaLobby}
              className="w-full sm:w-auto"
            >
              Voltar ao Lobby
            </Button>
            <Button
              onClick={() => {
                setDialogFim(false);
                // Implementar revanche
              }}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            >
              Jogar Novamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de desistência */}
      <Dialog open={dialogDesistir} onOpenChange={setDialogDesistir}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desistir da partida?</DialogTitle>
            <DialogDescription>
              Você perderá as fichas apostadas e a partida será encerrada para
              todos os jogadores.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogDesistir(false)}
            >
              Continuar jogando
            </Button>
            <Button
              variant="destructive"
              onClick={confirmarDesistencia}
            >
              Desistir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
