'use client';

import { motion } from 'framer-motion';
import { Carta as CartaType } from '@/types/game';
import { obterSimboloNaipe, obterCorNaipe } from '@/lib/truco-logic';
import { cn } from '@/lib/utils';

interface CartaProps {
  carta: CartaType;
  onClick?: () => void;
  disabled?: boolean;
  selecionada?: boolean;
  virada?: boolean;
  tamanho?: 'sm' | 'md' | 'lg';
  className?: string;
  delay?: number;
}

export function CartaComponent({
  carta,
  onClick,
  disabled = false,
  selecionada = false,
  virada = false,
  tamanho = 'md',
  className,
  delay = 0,
}: CartaProps) {
  const simbolo = obterSimboloNaipe(carta.naipe);
  const cor = obterCorNaipe(carta.naipe);

  const tamanhos = {
    sm: 'w-12 h-16 text-xs',
    md: 'w-16 h-24 text-sm',
    lg: 'w-20 h-28 text-base',
  };

  const corClasse = cor === 'red' ? 'text-red-600' : 'text-gray-900';

  if (virada) {
    return (
      <motion.div
        initial={{ rotateY: 180, scale: 0.8 }}
        animate={{ rotateY: 0, scale: 1 }}
        transition={{ duration: 0.3, delay }}
        className={cn(
          tamanhos[tamanho],
          'rounded-lg shadow-lg cursor-default',
          'bg-gradient-to-br from-blue-800 to-blue-900',
          'border-2 border-blue-700',
          'flex items-center justify-center',
          className
        )}
      >
        <div className="w-full h-full rounded-md m-1 border border-blue-600/50 flex items-center justify-center">
          <div className="text-blue-400/50 text-2xl">♠</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.button
      initial={{ y: 50, opacity: 0, rotateY: 90 }}
      animate={{
        y: selecionada ? -10 : 0,
        opacity: 1,
        rotateY: 0,
        scale: selecionada ? 1.05 : 1,
      }}
      whileHover={!disabled ? { y: -8, scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{
        duration: 0.3,
        delay,
        y: { type: 'spring', stiffness: 300 },
      }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        tamanhos[tamanho],
        'rounded-lg shadow-lg transition-shadow',
        'bg-gradient-to-br from-white to-gray-100',
        'border-2',
        selecionada ? 'border-yellow-400 shadow-yellow-400/50' : 'border-gray-300',
        !disabled && 'hover:shadow-xl cursor-pointer',
        disabled && 'opacity-70 cursor-not-allowed',
        'flex flex-col items-center justify-between p-1',
        className
      )}
    >
      {/* Canto superior esquerdo */}
      <div className={cn('self-start font-bold', corClasse)}>
        <div className="leading-none">{carta.valor}</div>
        <div className="text-lg leading-none">{simbolo}</div>
      </div>

      {/* Centro */}
      <div className={cn('text-3xl', corClasse)}>{simbolo}</div>

      {/* Canto inferior direito */}
      <div className={cn('self-end font-bold rotate-180', corClasse)}>
        <div className="leading-none">{carta.valor}</div>
        <div className="text-lg leading-none">{simbolo}</div>
      </div>
    </motion.button>
  );
}

// Carta jogada na mesa
export function CartaMesa({
  carta,
  posicao,
  className,
}: {
  carta: CartaType;
  posicao: 'sul' | 'norte' | 'leste' | 'oeste';
  className?: string;
}) {
  const simbolo = obterSimboloNaipe(carta.naipe);
  const cor = obterCorNaipe(carta.naipe);
  const corClasse = cor === 'red' ? 'text-red-600' : 'text-gray-900';

  const posicoes = {
    sul: { x: 0, y: 30, rotate: 0 },
    norte: { x: 0, y: -30, rotate: 180 },
    leste: { x: 30, y: 0, rotate: 90 },
    oeste: { x: -30, y: 0, rotate: -90 },
  };

  const { x, y, rotate } = posicoes[posicao];

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, x: x * 3, y: y * 3 }}
      animate={{ scale: 1, opacity: 1, x, y, rotate }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      className={cn(
        'w-14 h-20 rounded-lg shadow-lg absolute',
        'bg-gradient-to-br from-white to-gray-100',
        'border-2 border-gray-300',
        'flex flex-col items-center justify-between p-1',
        className
      )}
    >
      <div className={cn('self-start font-bold text-xs', corClasse)}>
        <div className="leading-none">{carta.valor}</div>
        <div className="text-sm leading-none">{simbolo}</div>
      </div>
      <div className={cn('text-xl', corClasse)}>{simbolo}</div>
    </motion.div>
  );
}

// Verso da carta para oponentes
export function CartaVerso({
  tamanho = 'md',
  className,
}: {
  tamanho?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const tamanhos = {
    sm: 'w-8 h-12',
    md: 'w-12 h-18',
    lg: 'w-14 h-20',
  };

  return (
    <div
      className={cn(
        tamanhos[tamanho],
        'rounded-lg shadow-md',
        'bg-gradient-to-br from-blue-800 to-blue-900',
        'border border-blue-700',
        'flex items-center justify-center',
        className
      )}
    >
      <div className="w-[90%] h-[90%] rounded border border-blue-600/30 flex items-center justify-center">
        <span className="text-blue-400/30 text-sm">♠</span>
      </div>
    </div>
  );
}
