'use client';

import { useState } from 'react';
import { Carta as CartaType, Partida, Jogador } from '@/types/game';
import { obterImagemCarta } from '@/lib/truco-logic';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Crown, Coins } from 'lucide-react';

// Card component
interface CartaProps {
  carta: CartaType;
  onClick?: () => void;
  selecionada?: boolean;
  virada?: boolean;
  disabled?: boolean;
  tamanho?: 'sm' | 'md' | 'lg';
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
    sm: 'w-12 h-16',
    md: 'w-16 h-22',
    lg: 'w-20 h-28',
  };

  const cardImagePath = virada ? '/cardB.png' : obterImagemCarta(carta);

  return (
    <motion.div
      className={cn(
        tamanhos[tamanho],
        'relative cursor-pointer transition-all duration-200 rounded-lg overflow-hidden',
        selecionada && 'ring-4 ring-yellow-400 -translate-y-4',
        isHovered && !disabled && '-translate-y-2',
        disabled && 'opacity-50 cursor-not-allowed'
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
        className="w-full h-full object-cover rounded-lg shadow-lg"
        draggable={false}
      />
      {selecionada && (
        <motion.div
          className="absolute inset-0 bg-yellow-400/20 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </motion.div>
  );
}

// Player component
interface JogadorComponentProps {
  jogador: Jogador;
  posicao: 'sul' | 'norte' | 'leste' | 'oeste';
  ehVezDele: boolean;
  ehCriador?: boolean;
  ehVoce?: boolean;
}

function JogadorComponent({
  jogador,
  posicao,
  ehVezDele,
  ehCriador = false,
  ehVoce = false,
}: JogadorComponentProps) {
  const getInitials = (nome: string) => {
    return nome.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const posicaoStyles = {
    sul: 'flex-col',
    norte: 'flex-col',
    leste: 'flex-row-reverse items-center',
    oeste: 'flex-row items-center',
  };

  return (
    <motion.div
      className={cn('flex gap-2', posicaoStyles[posicao])}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <Avatar
          className={cn(
            'h-14 w-14 border-3 shadow-lg transition-all duration-300',
            ehVezDele ? 'border-yellow-400 ring-4 ring-yellow-400/50' : 'border-white/50',
            jogador.online ? '' : 'opacity-50'
          )}
        >
          <AvatarImage src={jogador.avatar} alt={jogador.nome} />
          <AvatarFallback className="bg-green-600 text-white text-lg">
            {getInitials(jogador.nome)}
          </AvatarFallback>
        </Avatar>
        {ehCriador && (
          <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
            <Crown className="h-3 w-3 text-white" />
          </div>
        )}
        {jogador.online ? (
          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full h-4 w-4 border-2 border-white" />
        ) : (
          <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full h-4 w-4 border-2 border-white" />
        )}
      </div>
      <div className="text-center">
        <Badge
          className={cn(
            'text-xs px-2 py-0.5',
            ehVoce ? 'bg-green-600' : 'bg-black/50'
          )}
        >
          {jogador.nome}{ehVoce && ' (Você)'}
        </Badge>
        <Badge className="mt-1 bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
          <Coins className="h-3 w-3 mr-1" />
          {jogador.fichas}
        </Badge>
      </div>
    </motion.div>
  );
}

// Played card on table
interface CartaMesaProps {
  carta: CartaType;
  posicao: 'sul' | 'norte' | 'leste' | 'oeste';
}

function CartaMesa({ carta, posicao }: CartaMesaProps) {
  const rotacoes = {
    sul: 0,
    norte: 180,
    leste: 90,
    oeste: -90,
  };

  const offsets = {
    sul: { x: 0, y: 30 },
    norte: { x: 0, y: -30 },
    leste: { x: 30, y: 0 },
    oeste: { x: -30, y: 0 },
  };

  return (
    <motion.div
      className="absolute"
      style={{
        transform: `translate(${offsets[posicao].x}px, ${offsets[posicao].y}px) rotate(${rotacoes[posicao]}deg)`,
      }}
      initial={{ opacity: 0, scale: 0, y: posicao === 'sul' ? 50 : posicao === 'norte' ? -50 : 0 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <CartaComponent carta={carta} tamanho="md" disabled />
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
    <div className="relative w-full aspect-[4/3] min-h-[500px] max-h-[700px]">
      {/* Table background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-700 to-green-800 rounded-3xl border-8 border-amber-900/70 shadow-2xl overflow-hidden">
        {/* Felt texture */}
        <div className="absolute inset-4 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl border-4 border-green-800/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-500/20 via-transparent to-transparent" />
      </div>

      {/* Score display */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-4 z-10">
        <div className="bg-blue-600/90 backdrop-blur px-4 py-2 rounded-lg text-white font-bold shadow-lg">
          Time A: {partida.times.A.pontos}
        </div>
        <div className="bg-red-600/90 backdrop-blur px-4 py-2 rounded-lg text-white font-bold shadow-lg">
          Time B: {partida.times.B.pontos}
        </div>
      </div>

      {/* Truco value indicator */}
      {maoAtual && maoAtual.valorAposta > 1 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 left-4 bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg z-10 shadow-lg"
        >
          {maoAtual.valorAposta === 3 && 'TRUCO!'}
          {maoAtual.valorAposta === 6 && 'SEIS!'}
          {maoAtual.valorAposta === 9 && 'NOVE!'}
          {maoAtual.valorAposta === 12 && 'DOZE!'}
        </motion.div>
      )}

      {/* Vira card */}
      {maoAtual?.vira && (
        <div className="absolute top-16 right-4 z-10">
          <p className="text-white/70 text-xs text-center mb-1">VIRA</p>
          <CartaComponent carta={maoAtual.vira} tamanho="sm" disabled />
        </div>
      )}

      {/* Players positions */}
      {/* Norte (top) */}
      {jogadores.norte && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
          <JogadorComponent
            jogador={jogadores.norte}
            posicao="norte"
            ehVezDele={partida.jogadorDaVez === jogadores.norte.id}
          />
          {/* Opponent cards (face down) */}
          <div className="flex justify-center gap-1 mt-2">
            {jogadores.norte.cartas.map((_, i) => (
              <div key={i} className="w-8 h-12 bg-blue-900 rounded border border-blue-700 shadow" />
            ))}
          </div>
        </div>
      )}

      {/* Oeste (left) */}
      {jogadores.oeste && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <JogadorComponent
            jogador={jogadores.oeste}
            posicao="oeste"
            ehVezDele={partida.jogadorDaVez === jogadores.oeste.id}
          />
          {/* Opponent cards (face down) */}
          <div className="flex flex-col gap-1 mt-2">
            {jogadores.oeste.cartas.map((_, i) => (
              <div key={i} className="w-8 h-12 bg-blue-900 rounded border border-blue-700 shadow" />
            ))}
          </div>
        </div>
      )}

      {/* Leste (right) */}
      {jogadores.leste && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
          <JogadorComponent
            jogador={jogadores.leste}
            posicao="leste"
            ehVezDele={partida.jogadorDaVez === jogadores.leste.id}
          />
          {/* Opponent cards (face down) */}
          <div className="flex flex-col gap-1 mt-2">
            {jogadores.leste.cartas.map((_, i) => (
              <div key={i} className="w-8 h-12 bg-blue-900 rounded border border-blue-700 shadow" />
            ))}
          </div>
        </div>
      )}

      {/* Center area - played cards */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="relative w-40 h-40">
          <AnimatePresence>
            {(['sul', 'norte', 'leste', 'oeste'] as const).map((pos) => {
              const carta = getCartaJogadaPorPosicao(pos);
              if (!carta) return null;
              return <CartaMesa key={`mesa-${pos}`} carta={carta} posicao={pos} />;
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Round indicator */}
      {maoAtual && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-white/10 text-white">
            Rodada {maoAtual.rodadas.length}/3 | Mão {maoAtual.numero}
          </Badge>
        </div>
      )}

      {/* Sul (bottom) - Current player */}
      {jogador && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          {/* Player info */}
          <div className="mb-4 flex justify-center">
            <JogadorComponent
              jogador={jogador}
              posicao="sul"
              ehVezDele={ehMinhaVez}
              ehVoce
            />
          </div>

          {/* My cards */}
          <div className="flex justify-center gap-2">
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
        </div>
      )}

      {/* Turn indicator */}
      {ehMinhaVez && partida.status === 'em_andamento' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-56 left-1/2 -translate-x-1/2 bg-yellow-500/90 backdrop-blur text-black font-semibold px-6 py-3 rounded-full z-20 shadow-lg"
        >
          {cartaSelecionada
            ? 'Clique novamente para jogar!'
            : 'Sua vez! Selecione uma carta'}
        </motion.div>
      )}
    </div>
  );
}
