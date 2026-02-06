'use client';

import { useState } from 'react';
import { Carta as CartaType, Partida, Jogador } from '@/types/game';
import { obterImagemCarta } from '@/lib/truco-logic';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Coins } from 'lucide-react';

// Card component with responsive sizing
interface CartaProps {
  carta: CartaType;
  onClick?: () => void;
  selecionada?: boolean;
  virada?: boolean;
  disabled?: boolean;
  tamanho?: 'xs' | 'sm' | 'md' | 'lg';
}

function CartaComponent({
  carta,
  onClick,
  selecionada = false,
  virada = false,
  disabled = false,
  tamanho = 'md',
}: CartaProps) {
  const [isHovered, setIsHovered] = useState(false);

  const tamanhos = {
    xs: 'w-8 h-11 sm:w-10 sm:h-14',
    sm: 'w-10 h-14 sm:w-12 sm:h-16',
    md: 'w-12 h-16 sm:w-14 sm:h-20',
    lg: 'w-14 h-20 sm:w-16 sm:h-22 md:w-20 md:h-28',
  };

  const cardImagePath = virada ? '/cardB.png' : obterImagemCarta(carta);

  return (
    <motion.div
      className={cn(
        tamanhos[tamanho],
        'relative cursor-pointer transition-all duration-200 rounded-md overflow-hidden flex-shrink-0',
        selecionada && 'ring-2 sm:ring-4 ring-yellow-400 -translate-y-2 sm:-translate-y-4',
        isHovered && !disabled && '-translate-y-1 sm:-translate-y-2',
        disabled && 'cursor-default'
      )}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cardImagePath}
        alt={virada ? 'Card back' : `${carta.valor} de ${carta.naipe}`}
        className="w-full h-full object-cover rounded-md shadow-lg"
        draggable={false}
      />
      {selecionada && (
        <motion.div
          className="absolute inset-0 bg-yellow-400/20 rounded-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </motion.div>
  );
}

// Compact player info component
interface JogadorCompactoProps {
  jogador: Jogador;
  ehVezDele: boolean;
  ehVoce?: boolean;
  layout?: 'horizontal' | 'vertical';
  numCartas?: number;
}

function JogadorCompacto({
  jogador,
  ehVezDele,
  ehVoce = false,
  layout = 'vertical',
  numCartas = 0,
}: JogadorCompactoProps) {
  const getInitials = (nome: string) => {
    return nome.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={cn(
      'flex items-center gap-2',
      layout === 'vertical' ? 'flex-col' : 'flex-row'
    )}>
      <div className="relative">
        <Avatar
          className={cn(
            'w-10 h-10 sm:w-12 sm:h-12 border-2 shadow-lg transition-all duration-300',
            ehVezDele ? 'border-yellow-400 ring-2 ring-yellow-400/50' : 'border-white/30',
            !jogador.online && 'opacity-50'
          )}
        >
          <AvatarImage src={jogador.avatar} alt={jogador.nome} />
          <AvatarFallback className="bg-green-600 text-white text-sm">
            {getInitials(jogador.nome)}
          </AvatarFallback>
        </Avatar>
        {jogador.online ? (
          <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full w-3 h-3 border-2 border-green-800" />
        ) : (
          <div className="absolute -bottom-0.5 -right-0.5 bg-red-500 rounded-full w-3 h-3 border-2 border-green-800" />
        )}
      </div>
      <div className={cn(
        'flex gap-1',
        layout === 'vertical' ? 'flex-col items-center' : 'flex-col items-start'
      )}>
        <span className={cn(
          'text-white text-xs font-medium px-2 py-0.5 rounded truncate max-w-[80px] sm:max-w-[100px]',
          ehVoce ? 'bg-green-600' : 'bg-black/40'
        )}>
          {jogador.nome}
        </span>
        <span className="text-yellow-300 text-xs flex items-center gap-0.5 bg-black/30 px-1.5 py-0.5 rounded">
          <Coins className="w-3 h-3" />
          {jogador.fichas}
        </span>
      </div>
      {/* Hidden cards indicator for opponents */}
      {numCartas > 0 && (
        <div className={cn(
          'flex gap-0.5',
          layout === 'vertical' ? 'flex-row mt-1' : 'flex-col ml-1'
        )}>
          {Array.from({ length: numCartas }).map((_, i) => (
            <div
              key={i}
              className="w-5 h-7 sm:w-6 sm:h-8 bg-blue-900/80 rounded-sm border border-blue-700/50 shadow-sm"
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Played card on table
interface CartaMesaProps {
  carta: CartaType;
  posicao: 'sul' | 'norte' | 'leste' | 'oeste';
}

function CartaMesa({ carta, posicao }: CartaMesaProps) {
  const positionStyles = {
    sul: 'translate-y-8 sm:translate-y-12',
    norte: '-translate-y-8 sm:-translate-y-12',
    leste: 'translate-x-8 sm:translate-x-12',
    oeste: '-translate-x-8 sm:-translate-x-12',
  };

  return (
    <motion.div
      className={cn('absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2', positionStyles[posicao])}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <CartaComponent carta={carta} tamanho="sm" disabled />
    </motion.div>
  );
}

// Main table component
interface Mesa2DProps {
  partida: Partida;
  jogadorAtual: string;
  cartaSelecionada: CartaType | null;
  onSelecionarCarta: (carta: CartaType | null) => void;
  onJogarCarta: (carta: CartaType) => void;
}

export function Mesa2D({
  partida,
  jogadorAtual,
  cartaSelecionada,
  onSelecionarCarta,
  onJogarCarta,
}: Mesa2DProps) {
  const maoAtual = partida.maoAtual;
  const rodadaAtual = maoAtual?.rodadas[maoAtual.rodadas.length - 1];
  const jogador = partida.jogadores.find((j) => j.id === jogadorAtual);
  const ehMinhaVez = partida.jogadorDaVez === jogadorAtual;

  // Organize players by position relative to current player
  const getJogadoresRelativos = () => {
    const indiceAtual = partida.jogadores.findIndex((j) => j.id === jogadorAtual);
    const ordem = [];

    for (let i = 0; i < 4; i++) {
      const indice = (indiceAtual + i) % 4;
      ordem.push(partida.jogadores[indice]);
    }

    return {
      sul: ordem[0],
      oeste: ordem[1],
      norte: ordem[2],
      leste: ordem[3],
    };
  };

  const jogadores = getJogadoresRelativos();

  const getCartaJogadaPorPosicao = (posicao: 'sul' | 'norte' | 'leste' | 'oeste') => {
    if (!rodadaAtual) return null;
    const jogadorPosicao = jogadores[posicao];
    const cartaJogada = rodadaAtual.cartasJogadas.find(
      (cj) => cj.jogadorId === jogadorPosicao?.id
    );
    return cartaJogada?.carta;
  };

  const handleCartaClick = (carta: CartaType) => {
    if (!ehMinhaVez || partida.status !== 'em_andamento') return;

    if (cartaSelecionada?.id === carta.id) {
      onJogarCarta(carta);
    } else {
      onSelecionarCarta(carta);
    }
  };

  return (
    <div className="relative w-full bg-gradient-to-br from-green-700 to-green-800 rounded-2xl sm:rounded-3xl border-4 sm:border-8 border-amber-900/70 shadow-2xl overflow-hidden">
      {/* Inner felt */}
      <div className="absolute inset-2 sm:inset-4 bg-gradient-to-br from-green-600 to-green-700 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-green-800/50" />

      {/* Main grid layout */}
      <div className="relative grid grid-rows-[auto_1fr_auto] min-h-[400px] sm:min-h-[500px] md:min-h-[550px] p-2 sm:p-4">

        {/* Top section: Score + North player */}
        <div className="flex flex-col items-center gap-2 sm:gap-3 pb-2">
          {/* Score display */}
          <div className="flex gap-2 sm:gap-4">
            <div className="bg-blue-600/90 backdrop-blur px-3 sm:px-4 py-1 sm:py-2 rounded-lg text-white font-bold shadow-lg text-sm sm:text-base">
              Time A: {partida.times.A.pontos}
            </div>
            <div className="bg-red-600/90 backdrop-blur px-3 sm:px-4 py-1 sm:py-2 rounded-lg text-white font-bold shadow-lg text-sm sm:text-base">
              Time B: {partida.times.B.pontos}
            </div>
          </div>

          {/* North player */}
          {jogadores.norte && (
            <JogadorCompacto
              jogador={jogadores.norte}
              ehVezDele={partida.jogadorDaVez === jogadores.norte.id}
              numCartas={jogadores.norte.cartas.length}
            />
          )}
        </div>

        {/* Middle section: West + Center + East */}
        <div className="flex items-center justify-between px-1 sm:px-2">
          {/* West player */}
          <div className="flex-shrink-0">
            {jogadores.oeste && (
              <JogadorCompacto
                jogador={jogadores.oeste}
                ehVezDele={partida.jogadorDaVez === jogadores.oeste.id}
                layout="vertical"
                numCartas={jogadores.oeste.cartas.length}
              />
            )}
          </div>

          {/* Center area - played cards + game info */}
          <div className="flex-1 flex flex-col items-center justify-center mx-2 sm:mx-4">
            {/* Truco indicator */}
            {maoAtual && maoAtual.valorAposta > 1 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-yellow-500 text-black font-bold px-3 sm:px-4 py-1 sm:py-2 rounded-lg shadow-lg text-sm sm:text-base mb-2"
              >
                {maoAtual.valorAposta === 3 && 'TRUCO!'}
                {maoAtual.valorAposta === 6 && 'SEIS!'}
                {maoAtual.valorAposta === 9 && 'NOVE!'}
                {maoAtual.valorAposta === 12 && 'DOZE!'}
              </motion.div>
            )}

            {/* Played cards area */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48">
              <AnimatePresence>
                {(['sul', 'norte', 'leste', 'oeste'] as const).map((pos) => {
                  const carta = getCartaJogadaPorPosicao(pos);
                  if (!carta) return null;
                  return <CartaMesa key={`mesa-${pos}`} carta={carta} posicao={pos} />;
                })}
              </AnimatePresence>
            </div>

            {/* Round info */}
            {maoAtual && (
              <Badge className="bg-black/30 text-white border-0 text-xs mt-2">
                Rodada {maoAtual.rodadas.length}/3 | Mao {maoAtual.numero}
              </Badge>
            )}
          </div>

          {/* East player + Vira card */}
          <div className="flex-shrink-0 flex flex-col items-center gap-3">
            {jogadores.leste && (
              <JogadorCompacto
                jogador={jogadores.leste}
                ehVezDele={partida.jogadorDaVez === jogadores.leste.id}
                layout="vertical"
                numCartas={jogadores.leste.cartas.length}
              />
            )}

            {/* Vira card */}
            {maoAtual?.vira && (
              <div className="flex flex-col items-center">
                <span className="text-white/70 text-xs mb-1">VIRA</span>
                <CartaComponent carta={maoAtual.vira} tamanho="xs" disabled />
              </div>
            )}
          </div>
        </div>

        {/* Bottom section: Turn indicator + Current player + Cards */}
        <div className="flex flex-col items-center gap-2 pt-2">
          {/* Turn indicator */}
          {ehMinhaVez && partida.status === 'em_andamento' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-500/90 text-black font-semibold px-4 py-1.5 sm:py-2 rounded-full shadow-lg text-xs sm:text-sm"
            >
              {cartaSelecionada
                ? 'Clique novamente para jogar!'
                : 'Sua vez! Selecione uma carta'}
            </motion.div>
          )}

          {/* Current player info */}
          {jogador && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Avatar
                  className={cn(
                    'w-10 h-10 sm:w-12 sm:h-12 border-2 shadow-lg transition-all duration-300',
                    ehMinhaVez ? 'border-yellow-400 ring-2 ring-yellow-400/50' : 'border-white/30'
                  )}
                >
                  <AvatarImage src={jogador.avatar} alt={jogador.nome} />
                  <AvatarFallback className="bg-green-600 text-white text-sm">
                    {jogador.nome.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full w-3 h-3 border-2 border-green-800" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-white text-xs font-medium px-2 py-0.5 rounded bg-green-600">
                  {jogador.nome} (Voce)
                </span>
                <span className="text-yellow-300 text-xs flex items-center gap-0.5 bg-black/30 px-1.5 py-0.5 rounded">
                  <Coins className="w-3 h-3" />
                  {jogador.fichas}
                </span>
              </div>
            </div>
          )}

          {/* My cards */}
          {jogador && (
            <div className="flex justify-center gap-1 sm:gap-2 pb-1">
              {jogador.cartas.map((carta) => (
                <CartaComponent
                  key={carta.id}
                  carta={carta}
                  tamanho="lg"
                  selecionada={cartaSelecionada?.id === carta.id}
                  onClick={() => handleCartaClick(carta)}
                  disabled={!ehMinhaVez || partida.status !== 'em_andamento'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
