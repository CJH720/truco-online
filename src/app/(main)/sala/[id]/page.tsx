'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useSocket } from '@/contexts/socket-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Users,
  Coins,
  Crown,
  ArrowLeft,
  Play,
  UserPlus,
  Share2,
  Send,
  MessageCircle,
  Wifi,
  WifiOff,
} from 'lucide-react';

export default function SalaPage() {
  const router = useRouter();
  const params = useParams();
  const { usuario } = useAuthStore();
  const {
    isConnected,
    currentRoom,
    gameState,
    messages,
    leaveRoom,
    startGame,
    sendMessage,
    joinRoom,
  } = useSocket();

  const [copiado, setCopiado] = useState(false);
  const [mensagem, setMensagem] = useState('');

  // If no current room, try to join by ID
  useEffect(() => {
    if (!currentRoom && params.id && isConnected) {
      joinRoom(params.id as string);
    }
  }, [currentRoom, params.id, isConnected, joinRoom]);

  // Redirect to game if game started
  useEffect(() => {
    if (gameState && gameState.status === 'em_andamento') {
      router.push(`/jogo/${currentRoom?.id}`);
    }
  }, [gameState, currentRoom, router]);

  if (!currentRoom || !usuario) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p className="text-white">Conectando à sala...</p>
        </div>
      </div>
    );
  }

  const copiarCodigo = () => {
    navigator.clipboard.writeText(currentRoom.codigo);
    setCopiado(true);
    toast.success('Código copiado!');
    setTimeout(() => setCopiado(false), 2000);
  };

  const compartilharSala = async () => {
    const url = `${window.location.origin}/sala/${currentRoom.id}`;
    const texto = `Venha jogar Truco comigo! Sala: ${currentRoom.nome} - Código: ${currentRoom.codigo}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Truco Online',
          text: texto,
          url: url,
        });
      } catch {
        console.log('Compartilhamento cancelado');
      }
    } else {
      navigator.clipboard.writeText(`${texto}\n${url}`);
      toast.success('Link copiado!');
    }
  };

  const handleIniciarPartida = () => {
    if (currentRoom.jogadores.length < 4) {
      toast.error('Aguarde 4 jogadores para iniciar');
      return;
    }
    startGame();
  };

  const handleSairSala = () => {
    leaveRoom();
    router.push('/lobby');
  };

  const handleEnviarMensagem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensagem.trim()) return;
    sendMessage(mensagem.trim());
    setMensagem('');
  };

  const ehCriador = currentRoom.criador === usuario.id;
  const posicoes = [
    { pos: 0, label: 'Sul', style: 'bottom-4 left-1/2 -translate-x-1/2' },
    { pos: 1, label: 'Oeste', style: 'left-4 top-1/2 -translate-y-1/2' },
    { pos: 2, label: 'Norte', style: 'top-4 left-1/2 -translate-x-1/2' },
    { pos: 3, label: 'Leste', style: 'right-4 top-1/2 -translate-y-1/2' },
  ];

  const getJogadorNaPosicao = (pos: number) => {
    return currentRoom.jogadores.find((j) => j.posicao === pos);
  };

  const getInitials = (nome: string) => {
    return nome.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header da Sala */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSairSala}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              {currentRoom.nome}
              <Badge
                variant={isConnected ? 'default' : 'destructive'}
                className={isConnected ? 'bg-green-600' : ''}
              >
                {isConnected ? (
                  <Wifi className="h-3 w-3" />
                ) : (
                  <WifiOff className="h-3 w-3" />
                )}
              </Badge>
            </h1>
            <div className="flex items-center gap-3 text-green-200">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {currentRoom.jogadores.length}/4
              </span>
              <span className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-yellow-400" />
                {currentRoom.aposta} fichas
              </span>
              <Badge className="bg-green-600/30 text-green-200">
                {currentRoom.variante}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={copiarCodigo}
            className="border-green-400 bg-transparent text-green-100 hover:bg-green-700/50 hover:text-white"
          >
            <Copy className="mr-2 h-4 w-4" />
            {copiado ? 'Copiado!' : currentRoom.codigo}
          </Button>
          <Button
            variant="outline"
            onClick={compartilharSala}
            className="border-green-400 bg-transparent text-green-100 hover:bg-green-700/50 hover:text-white"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Mesa de Jogo */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-green-700 to-green-800 border-4 border-amber-900/50 shadow-2xl">
            <CardContent className="p-0">
              <div className="relative aspect-[4/3] min-h-[400px]">
                {/* Textura da mesa */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-600/20 via-transparent to-transparent" />

                {/* Centro da mesa */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-green-900/50 rounded-full p-8 border-2 border-green-500/30"
                  >
                    <div className="text-center">
                      <p className="text-green-300 text-sm">Aguardando</p>
                      <p className="text-white font-bold text-lg">
                        {currentRoom.jogadores.length}/4 jogadores
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Posições dos jogadores */}
                <AnimatePresence>
                  {posicoes.map(({ pos, label, style }) => {
                    const jogador = getJogadorNaPosicao(pos);

                    return (
                      <motion.div
                        key={pos}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.3, delay: pos * 0.1 }}
                        className={`absolute ${style}`}
                      >
                        {jogador ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="relative">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                              >
                                <Avatar className="h-16 w-16 border-3 border-white shadow-lg">
                                  <AvatarImage src={jogador.avatar} alt={jogador.nome} />
                                  <AvatarFallback className="bg-green-600 text-white text-lg">
                                    {getInitials(jogador.nome)}
                                  </AvatarFallback>
                                </Avatar>
                              </motion.div>
                              {currentRoom.criador === jogador.id && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1"
                                >
                                  <Crown className="h-4 w-4 text-white" />
                                </motion.div>
                              )}
                              {jogador.online && (
                                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full h-4 w-4 border-2 border-white" />
                              )}
                              {!jogador.online && (
                                <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full h-4 w-4 border-2 border-white" />
                              )}
                            </div>
                            <div className="bg-black/50 backdrop-blur rounded-lg px-3 py-1">
                              <p className="text-white font-medium text-sm">
                                {jogador.nome}
                                {jogador.id === usuario.id && ' (Você)'}
                              </p>
                            </div>
                            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                              <Coins className="h-3 w-3 mr-1" />
                              {jogador.fichas}
                            </Badge>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <motion.div
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="h-16 w-16 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center bg-white/5"
                            >
                              <UserPlus className="h-6 w-6 text-white/50" />
                            </motion.div>
                            <p className="text-white/50 text-sm">{label}</p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Times */}
                <div className="absolute top-2 left-2">
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    Time A (Sul + Norte)
                  </Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                    Time B (Oeste + Leste)
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botão Iniciar */}
          {ehCriador && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex justify-center"
            >
              <Button
                size="lg"
                onClick={handleIniciarPartida}
                disabled={currentRoom.jogadores.length < 4}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-lg px-8 py-6 shadow-lg"
              >
                <Play className="mr-2 h-6 w-6" />
                {currentRoom.jogadores.length < 4
                  ? `Aguardando ${4 - currentRoom.jogadores.length} jogador(es)`
                  : 'Iniciar Partida'}
              </Button>
            </motion.div>
          )}
        </div>

        {/* Chat e Informações */}
        <div className="space-y-6">
          {/* Chat */}
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat da Sala
              </h3>

              <ScrollArea className="h-[200px] mb-4">
                <div className="space-y-2">
                  {messages.length === 0 ? (
                    <p className="text-green-300/50 text-sm text-center">
                      Nenhuma mensagem ainda
                    </p>
                  ) : (
                    messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`text-sm ${
                          msg.jogadorId === usuario.id
                            ? 'text-green-300'
                            : 'text-white'
                        }`}
                      >
                        <span className="font-medium">{msg.jogadorNome}:</span>{' '}
                        {msg.conteudo}
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>

              <form onSubmit={handleEnviarMensagem} className="flex gap-2">
                <Input
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!mensagem.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Informações da Sala */}
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Jogadores na Sala
              </h3>

              <div className="space-y-3">
                {currentRoom.jogadores.map((jogador) => (
                  <motion.div
                    key={jogador.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={jogador.avatar} alt={jogador.nome} />
                        <AvatarFallback className="bg-green-600 text-white">
                          {getInitials(jogador.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-medium flex items-center gap-2">
                          {jogador.nome}
                          {jogador.id === usuario.id && (
                            <Badge className="bg-green-600 text-xs">Você</Badge>
                          )}
                          {currentRoom.criador === jogador.id && (
                            <Crown className="h-4 w-4 text-yellow-400" />
                          )}
                        </p>
                        <p className="text-green-300 text-sm flex items-center gap-1">
                          <Coins className="h-3 w-3" />
                          {jogador.fichas} fichas
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          jogador.posicao % 2 === 0
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-red-500/20 text-red-300'
                        }
                      >
                        Time {jogador.posicao % 2 === 0 ? 'A' : 'B'}
                      </Badge>
                      <div
                        className={`h-3 w-3 rounded-full ${
                          jogador.online ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </motion.div>
                ))}

                {Array.from({ length: 4 - currentRoom.jogadores.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="flex items-center justify-center bg-white/5 rounded-lg p-3 border-2 border-dashed border-white/20"
                  >
                    <p className="text-white/50 text-sm">Aguardando jogador...</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Convite */}
          <Card className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-yellow-500/30">
            <CardContent className="p-6">
              <h3 className="text-yellow-200 font-semibold mb-3 flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Convide seus amigos!
              </h3>
              <p className="text-yellow-100/80 text-sm mb-4">
                Compartilhe o código da sala ou o link para seus amigos entrarem.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={copiarCodigo}
                  className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-100"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {currentRoom.codigo}
                </Button>
                <Button
                  variant="secondary"
                  onClick={compartilharSala}
                  className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-100"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Regras Rápidas */}
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-3">Regras - Truco Paulista</h3>
              <ul className="text-green-200 text-sm space-y-2">
                <li>• 4 jogadores em duplas</li>
                <li>• Vence quem fizer 12 pontos</li>
                <li>• Manilha: carta seguinte à vira</li>
                <li>• Ordem das manilhas: ♦ ♠ ♥ ♣</li>
                <li>• Truco: 3 → 6 → 9 → 12 pontos</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
