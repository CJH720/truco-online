'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Partida } from '@/types/game';
import { proximoValorTruco, nomeValorTruco } from '@/lib/truco-logic';
import { Zap, ThumbsUp, ThumbsDown, Flag } from 'lucide-react';

interface BotoesAcaoProps {
  partida: Partida;
  jogadorAtual: string;
  onPedirTruco: () => void;
  onAceitarTruco: () => void;
  onRecusarTruco: () => void;
  onDesistir: () => void;
}

export function BotoesAcao({
  partida,
  jogadorAtual,
  onPedirTruco,
  onAceitarTruco,
  onRecusarTruco,
  onDesistir,
}: BotoesAcaoProps) {
  const maoAtual = partida.maoAtual;
  const jogador = partida.jogadores.find((j) => j.id === jogadorAtual);

  if (!maoAtual || !jogador) return null;

  const timeDoJogador = jogador.posicao % 2 === 0 ? 'A' : 'B';
  const proximoValor = proximoValorTruco(maoAtual.valorAposta);
  const podePedirTruco = proximoValor !== null && maoAtual.timeQuePediu !== timeDoJogador;

  // Se foi pedido truco e é meu time que precisa responder
  const precisoResponderTruco =
    partida.status === 'truco_pedido' && maoAtual.timeQuePediu !== timeDoJogador;

  return (
    <div className="flex flex-wrap justify-center gap-3 p-4 bg-black/30 backdrop-blur rounded-xl">
      <AnimatePresence mode="wait">
        {precisoResponderTruco ? (
          // Botões de resposta ao truco
          <motion.div
            key="resposta-truco"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center gap-3"
          >
            <p className="text-yellow-300 font-bold text-lg animate-pulse">
              {nomeValorTruco(maoAtual.valorAposta === 1 ? 3 : maoAtual.valorAposta)}! O que você faz?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={onAceitarTruco}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                <ThumbsUp className="mr-2 h-5 w-5" />
                Aceitar
              </Button>

              {/* Aumentar */}
              {proximoValorTruco(proximoValorTruco(maoAtual.valorAposta)!) && (
                <Button
                  onClick={() => {
                    onAceitarTruco();
                    setTimeout(onPedirTruco, 100);
                  }}
                  size="lg"
                  className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  {nomeValorTruco(proximoValorTruco(proximoValorTruco(maoAtual.valorAposta)!)!)}!
                </Button>
              )}

              <Button
                onClick={onRecusarTruco}
                size="lg"
                variant="destructive"
                className="font-bold"
              >
                <ThumbsDown className="mr-2 h-5 w-5" />
                Correr
              </Button>
            </div>
          </motion.div>
        ) : (
          // Botões normais
          <motion.div
            key="acoes-normais"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-3"
          >
            {/* Pedir Truco */}
            {podePedirTruco && partida.status === 'em_andamento' && (
              <Button
                onClick={onPedirTruco}
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold shadow-lg"
              >
                <Zap className="mr-2 h-5 w-5" />
                {nomeValorTruco(proximoValor)}!
              </Button>
            )}

            {/* Emojis rápidos */}
            <div className="flex gap-1">
              {['👍', '😄', '😢', '🤔'].map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="icon"
                  className="text-2xl hover:bg-white/10"
                  onClick={() => {
                    // Implementar envio de emoji
                  }}
                >
                  {emoji}
                </Button>
              ))}
            </div>

            {/* Desistir */}
            <Button
              onClick={onDesistir}
              variant="ghost"
              size="lg"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Flag className="mr-2 h-4 w-4" />
              Desistir
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
