'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TrucoEffectsProps {
  valorAposta: number;
  trucoPedido: boolean;
  timeQuePediu?: 'A' | 'B';
  onAnimationComplete?: () => void;
}

export function TrucoEffects({
  valorAposta,
  trucoPedido,
  timeQuePediu,
  onAnimationComplete,
}: TrucoEffectsProps) {
  const [showEffect, setShowEffect] = useState(false);
  const [prevValor, setPrevValor] = useState(valorAposta);

  // Trigger effect when valor changes or truco is called
  useEffect(() => {
    if (trucoPedido || valorAposta > prevValor) {
      setShowEffect(true);
      const timer = setTimeout(() => {
        setShowEffect(false);
        onAnimationComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
    setPrevValor(valorAposta);
  }, [trucoPedido, valorAposta, prevValor, onAnimationComplete]);

  const getTrucoText = () => {
    if (trucoPedido) {
      switch (valorAposta) {
        case 1:
          return 'TRUCO!';
        case 3:
          return 'SEIS!';
        case 6:
          return 'NOVE!';
        case 9:
          return 'DOZE!';
        default:
          return 'TRUCO!';
      }
    }
    return '';
  };

  const getTeamColor = () => {
    return timeQuePediu === 'A' ? '#3B82F6' : '#EF4444';
  };

  return (
    <AnimatePresence>
      {showEffect && trucoPedido && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Background flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
            style={{ backgroundColor: getTeamColor() }}
          />

          {/* Radial burst effect */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 3, 4], opacity: [1, 0.5, 0] }}
            transition={{ duration: 1.5 }}
            className="absolute w-64 h-64 rounded-full"
            style={{
              background: `radial-gradient(circle, ${getTeamColor()}40 0%, transparent 70%)`,
            }}
          />

          {/* Card explosion particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0.5],
                rotate: [0, 180 + i * 45],
                x: Math.cos((i * Math.PI) / 4) * 200,
                y: Math.sin((i * Math.PI) / 4) * 200,
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 1, delay: i * 0.05 }}
              className="absolute text-4xl"
            >
              🃏
            </motion.div>
          ))}

          {/* Main text */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{
              scale: [0, 1.5, 1.2],
              rotate: [-10, 5, 0],
            }}
            transition={{
              duration: 0.5,
              type: 'spring',
              stiffness: 200,
            }}
            className="relative"
          >
            {/* Glow effect */}
            <motion.div
              animate={{
                textShadow: [
                  `0 0 20px ${getTeamColor()}`,
                  `0 0 60px ${getTeamColor()}`,
                  `0 0 20px ${getTeamColor()}`,
                ],
              }}
              transition={{ duration: 0.5, repeat: 3 }}
              className="text-7xl md:text-9xl font-black text-white drop-shadow-2xl"
              style={{
                WebkitTextStroke: `3px ${getTeamColor()}`,
              }}
            >
              {getTrucoText()}
            </motion.div>

            {/* Shake effect */}
            <motion.div
              animate={{
                x: [0, -5, 5, -5, 5, 0],
                y: [0, -3, 3, -3, 3, 0],
              }}
              transition={{ duration: 0.3, repeat: 2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span
                className="text-7xl md:text-9xl font-black"
                style={{
                  color: getTeamColor(),
                  opacity: 0.3,
                  filter: 'blur(4px)',
                }}
              >
                {getTrucoText()}
              </span>
            </motion.div>
          </motion.div>

          {/* Team indicator */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-1/3"
          >
            <div
              className="px-6 py-2 rounded-full text-white font-bold text-xl"
              style={{ backgroundColor: getTeamColor() }}
            >
              Time {timeQuePediu}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Victory/Defeat animation
interface GameEndEffectsProps {
  show: boolean;
  isVictory: boolean;
  timeVencedor: 'A' | 'B';
  onComplete?: () => void;
}

export function GameEndEffects({
  show,
  isVictory,
  timeVencedor,
  onComplete,
}: GameEndEffectsProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            className={`absolute inset-0 ${
              isVictory
                ? 'bg-gradient-to-b from-yellow-500/30 to-green-500/30'
                : 'bg-gradient-to-b from-gray-500/30 to-red-500/30'
            }`}
          />

          {/* Confetti for victory */}
          {isVictory &&
            [...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * window.innerWidth - window.innerWidth / 2,
                  y: -50,
                  rotate: 0,
                }}
                animate={{
                  y: window.innerHeight + 100,
                  rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                  x:
                    Math.random() * window.innerWidth -
                    window.innerWidth / 2 +
                    (Math.random() - 0.5) * 200,
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: 'linear',
                }}
                className="absolute w-4 h-4 rounded-sm"
                style={{
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][
                    Math.floor(Math.random() * 5)
                  ],
                }}
              />
            ))}

          {/* Trophy / Skull icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="text-9xl mb-4"
          >
            {isVictory ? '🏆' : '😢'}
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute top-1/2 mt-20 text-center"
          >
            <h1
              className={`text-5xl md:text-7xl font-black ${
                isVictory ? 'text-yellow-400' : 'text-gray-400'
              }`}
            >
              {isVictory ? 'VITÓRIA!' : 'DERROTA'}
            </h1>
            <p className="text-2xl text-white mt-4">
              Time {timeVencedor} venceu!
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Round winner animation
interface RoundWinnerEffectsProps {
  show: boolean;
  timeVencedor: 'A' | 'B' | 'empate';
  rodadaNumero: number;
}

export function RoundWinnerEffects({
  show,
  timeVencedor,
  rodadaNumero,
}: RoundWinnerEffectsProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
        >
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.5, repeat: 1 }}
            className={`px-8 py-4 rounded-2xl font-bold text-white text-2xl shadow-2xl ${
              timeVencedor === 'A'
                ? 'bg-blue-600'
                : timeVencedor === 'B'
                ? 'bg-red-600'
                : 'bg-gray-600'
            }`}
          >
            {timeVencedor === 'empate'
              ? `Rodada ${rodadaNumero} - Empate!`
              : `Time ${timeVencedor} venceu a rodada ${rodadaNumero}!`}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
