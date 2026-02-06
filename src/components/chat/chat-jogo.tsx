'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useGameStore } from '@/stores/game-store';
import { useAuthStore } from '@/stores/auth-store';
import { useSocket } from '@/contexts/socket-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageCircle, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { MensagemChat } from '@/types/game';

const EMOJIS_RAPIDOS = ['👍', '👎', '😄', '😢', '🤔', '😠', '🎉', '💪', '🃏', '🔥'];

export function ChatJogo() {
  const { mensagensChat: localMensagens, enviarMensagem: localEnviar } = useGameStore();
  const { messages: socketMessages, sendMessage: socketEnviar, currentRoom } = useSocket();
  const { usuario } = useAuthStore();
  const [mensagem, setMensagem] = useState('');
  const [mostrarEmojis, setMostrarEmojis] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use WebSocket messages if in a room, otherwise use local messages
  const isUsingWebSocket = !!currentRoom;

  // Convert socket messages to the expected format
  const mensagensChat: MensagemChat[] = useMemo(() => {
    if (isUsingWebSocket) {
      return socketMessages;
    }
    return localMensagens;
  }, [isUsingWebSocket, socketMessages, localMensagens]);

  const enviarMensagem = (msg: string, tipo?: 'mensagem' | 'emoji' | 'sistema') => {
    if (isUsingWebSocket) {
      socketEnviar(msg);
    } else {
      localEnviar(msg, tipo);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagensChat]);

  const handleEnviar = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!mensagem.trim()) return;

    enviarMensagem(mensagem.trim());
    setMensagem('');
  };

  const handleEnviarEmoji = (emoji: string) => {
    enviarMensagem(emoji, 'emoji');
    setMostrarEmojis(false);
  };

  const getInitials = (nome: string) => {
    return nome.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatarHora = (data: Date) => {
    return new Date(data).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="bg-white/10 border-white/20 h-full flex flex-col">
      <CardHeader className="py-3 px-4 border-b border-white/10">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Chat da Mesa
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Mensagens */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {mensagensChat.map((msg) => {
                const ehMinha = msg.jogadorId === usuario?.id;
                const ehEmoji = msg.tipo === 'emoji';
                const ehSistema = msg.tipo === 'sistema';

                if (ehSistema) {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                      <span className="text-xs text-green-300 bg-green-900/30 px-3 py-1 rounded-full">
                        {msg.conteudo}
                      </span>
                    </motion.div>
                  );
                }

                if (ehEmoji) {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        'flex items-center gap-2',
                        ehMinha ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {!ehMinha && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-green-600 text-white text-xs">
                            {getInitials(msg.jogadorNome)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <span className="text-4xl">{msg.conteudo}</span>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex items-start gap-2',
                      ehMinha ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    <Avatar className="h-7 w-7 flex-shrink-0">
                      <AvatarFallback className="bg-green-600 text-white text-xs">
                        {getInitials(msg.jogadorNome)}
                      </AvatarFallback>
                    </Avatar>

                    <div
                      className={cn(
                        'flex flex-col max-w-[70%]',
                        ehMinha ? 'items-end' : 'items-start'
                      )}
                    >
                      <span className="text-xs text-green-300 mb-1">
                        {ehMinha ? 'Você' : msg.jogadorNome}
                      </span>
                      <div
                        className={cn(
                          'rounded-lg px-3 py-2 text-sm',
                          ehMinha
                            ? 'bg-green-600 text-white rounded-br-none'
                            : 'bg-white/10 text-white rounded-bl-none'
                        )}
                      >
                        {msg.conteudo}
                      </div>
                      <span className="text-xs text-green-400/60 mt-1">
                        {formatarHora(msg.timestamp)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {mensagensChat.length === 0 && (
              <div className="text-center text-green-300/50 py-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma mensagem ainda</p>
                <p className="text-xs">Comece uma conversa!</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Emojis rápidos */}
        <AnimatePresence>
          {mostrarEmojis && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/10 overflow-hidden"
            >
              <div className="flex flex-wrap gap-1 p-2 justify-center">
                {EMOJIS_RAPIDOS.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className="text-xl hover:bg-white/10 h-10 w-10 p-0"
                    onClick={() => handleEnviarEmoji(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <form
          onSubmit={handleEnviar}
          className="p-3 border-t border-white/10 flex gap-2"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0',
              mostrarEmojis && 'bg-white/10 text-white'
            )}
            onClick={() => setMostrarEmojis(!mostrarEmojis)}
          >
            <Smile className="h-5 w-5" />
          </Button>

          <Input
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Digite uma mensagem..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 flex-1"
            maxLength={200}
          />

          <Button
            type="submit"
            size="icon"
            disabled={!mensagem.trim()}
            className="bg-green-600 hover:bg-green-700 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
