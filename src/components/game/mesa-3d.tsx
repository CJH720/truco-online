'use client';

import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Text,
  Html,
} from '@react-three/drei';
import * as THREE from 'three';
import { Carta as CartaType, Partida, Jogador } from '@/types/game';
import { obterImagemCarta } from '@/lib/truco-logic';
import { motion } from 'framer-motion';

// Componente de Loading
function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-green-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4" />
        <p className="text-white text-lg">Carregando mesa 3D...</p>
      </div>
    </div>
  );
}

// Mesa de feltro verde
function Mesa() {
  return (
    <group>
      {/* Tampo da mesa */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[5, 64]} />
        <meshStandardMaterial
          color="#1a5c1a"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Borda da mesa */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <ringGeometry args={[4.8, 5.5, 64]} />
        <meshStandardMaterial
          color="#5c3317"
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

      {/* Pernas da mesa */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i * Math.PI) / 2;
        const x = Math.cos(angle) * 4;
        const z = Math.sin(angle) * 4;
        return (
          <mesh key={i} position={[x, -1.5, z]} castShadow>
            <cylinderGeometry args={[0.15, 0.2, 3, 16]} />
            <meshStandardMaterial color="#3d2314" roughness={0.7} />
          </mesh>
        );
      })}

      {/* Textura do feltro */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[4.5, 64]} />
        <meshStandardMaterial
          color="#228B22"
          roughness={0.9}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

// Carta 3D
interface Carta3DProps {
  carta: CartaType;
  position: [number, number, number];
  rotation?: [number, number, number];
  onClick?: () => void;
  selecionada?: boolean;
  virada?: boolean;
  animarEntrada?: boolean;
  delay?: number;
}

function Carta3D({
  carta,
  position,
  rotation = [0, 0, 0],
  onClick,
  selecionada = false,
  virada = false,
  animarEntrada = true,
}: Carta3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);
  const targetY = selecionada ? position[1] + 0.3 : position[1];

  const cardImagePath = obterImagemCarta(carta);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Animação de entrada
    if (animarEntrada && animProgress < 1) {
      setAnimProgress((prev) => Math.min(prev + delta * 2, 1));
    }

    // Hover e seleção
    const currentY = meshRef.current.position.y;
    meshRef.current.position.y = THREE.MathUtils.lerp(
      currentY,
      hovered ? targetY + 0.1 : targetY,
      delta * 10
    );

    // Rotação suave quando selecionada
    if (selecionada) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  const initialY = animarEntrada ? position[1] - 2 : position[1];
  const currentY = THREE.MathUtils.lerp(initialY, position[1], animProgress);

  return (
    <group
      position={[position[0], currentY, position[2]]}
      rotation={rotation as [number, number, number]}
    >
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.7, 0.02, 1]} />
        <meshStandardMaterial
          color={virada ? '#1e3a5f' : '#ffffff'}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Card content - using actual card images */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {!virada && (
        <Html
          position={[0, 0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          transform
          occlude
          style={{
            pointerEvents: 'none',
          }}
        >
          {/* Using img instead of next/image because it's inside Three.js Html component */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cardImagePath}
            alt={`${carta.valor} de ${carta.naipe}`}
            style={{
              width: '70px',
              height: '98px',
              borderRadius: '4px',
              boxShadow: selecionada ? '0 0 15px rgba(234, 179, 8, 0.9)' : '0 2px 8px rgba(0,0,0,0.3)',
              border: selecionada ? '3px solid #eab308' : 'none',
            }}
          />
        </Html>
      )}

      {/* Flipped card - using cardB.png */}
      {virada && (
        <Html
          position={[0, 0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          transform
          occlude
          style={{
            pointerEvents: 'none',
          }}
        >
          {/* Using img instead of next/image because it's inside Three.js Html component */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/cardB.png"
            alt="Card back"
            style={{
              width: '70px',
              height: '98px',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          />
        </Html>
      )}
    </group>
  );
}

// Carta na mesa (jogada)
function CartaMesa3D({
  carta,
  posicao,
}: {
  carta: CartaType;
  posicao: 'sul' | 'norte' | 'leste' | 'oeste';
}) {
  const meshRef = useRef<THREE.Group>(null);
  const [scale, setScale] = useState(0);

  const posicoes: Record<string, [number, number, number]> = {
    sul: [0, 0.1, 1],
    norte: [0, 0.1, -1],
    leste: [1, 0.1, 0],
    oeste: [-1, 0.1, 0],
  };

  const rotacoes: Record<string, [number, number, number]> = {
    sul: [-Math.PI / 2, 0, 0],
    norte: [-Math.PI / 2, 0, Math.PI],
    leste: [-Math.PI / 2, 0, Math.PI / 2],
    oeste: [-Math.PI / 2, 0, -Math.PI / 2],
  };

  useFrame((_, delta) => {
    setScale((prev) => Math.min(prev + delta * 5, 1));
  });

  const cardImagePath = obterImagemCarta(carta);

  return (
    <group
      ref={meshRef}
      position={posicoes[posicao]}
      rotation={rotacoes[posicao] as [number, number, number]}
      scale={scale}
    >
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.02, 0.85]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>

      <Html
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        transform
        occlude
        style={{
          pointerEvents: 'none',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cardImagePath}
          alt={`${carta.valor} de ${carta.naipe}`}
          style={{
            width: '55px',
            height: '77px',
            borderRadius: '3px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
        />
      </Html>
    </group>
  );
}

// Jogador 3D
function Jogador3D({
  jogador,
  posicao,
  ehVezDele,
  numCartas,
}: {
  jogador: Jogador;
  posicao: 'sul' | 'norte' | 'leste' | 'oeste';
  ehVezDele: boolean;
  numCartas: number;
}) {
  const posicoes: Record<string, [number, number, number]> = {
    sul: [0, 0.5, 4],
    norte: [0, 0.5, -4],
    leste: [4, 0.5, 0],
    oeste: [-4, 0.5, 0],
  };

  const rotacoes: Record<string, number> = {
    sul: 0,
    norte: Math.PI,
    leste: -Math.PI / 2,
    oeste: Math.PI / 2,
  };

  return (
    <group position={posicoes[posicao]} rotation={[0, rotacoes[posicao], 0]}>
      {/* Avatar do jogador */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color={ehVezDele ? '#eab308' : '#22c55e'}
          emissive={ehVezDele ? '#eab308' : '#000000'}
          emissiveIntensity={ehVezDele ? 0.3 : 0}
        />
      </mesh>

      {/* Nome do jogador */}
      <Text
        position={[0, 1, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {jogador.nome}
      </Text>

      {/* Cartas do oponente (viradas) */}
      {posicao !== 'sul' && (
        <group position={[0, 0, 0.8]}>
          {Array.from({ length: numCartas }).map((_, i) => (
            <Carta3D
              key={i}
              carta={{ id: `temp-${i}`, valor: 'A', naipe: 'espadas', codigo: '' }}
              position={[(i - 1) * 0.3, 0.1, 0]}
              virada={true}
              animarEntrada={false}
            />
          ))}
        </group>
      )}

      {/* Indicador de vez */}
      {ehVezDele && (
        <mesh position={[0, 0.9, 0]}>
          <ringGeometry args={[0.35, 0.4, 32]} />
          <meshBasicMaterial color="#eab308" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// Iluminação
function Iluminacao() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffcc" />
    </>
  );
}

// Cena principal
interface Cena3DProps {
  partida: Partida;
  jogadorAtual: string;
  cartaSelecionada: CartaType | null;
  onSelecionarCarta: (carta: CartaType | null) => void;
  onJogarCarta: (carta: CartaType) => void;
}

function Cena3D({
  partida,
  jogadorAtual,
  cartaSelecionada,
  onSelecionarCarta,
  onJogarCarta,
}: Cena3DProps) {
  const maoAtual = partida.maoAtual;
  const rodadaAtual = maoAtual?.rodadas[maoAtual.rodadas.length - 1];

  const jogador = partida.jogadores.find((j) => j.id === jogadorAtual);
  const ehMinhaVez = partida.jogadorDaVez === jogadorAtual;

  // Organizar jogadores por posição
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
    <>
      <Iluminacao />
      <Mesa />

      {/* Cartas jogadas na mesa */}
      {(['sul', 'norte', 'leste', 'oeste'] as const).map((pos) => {
        const carta = getCartaJogadaPorPosicao(pos);
        if (!carta) return null;
        return <CartaMesa3D key={`mesa-${pos}`} carta={carta} posicao={pos} />;
      })}

      {/* Jogadores */}
      {(['norte', 'leste', 'oeste'] as const).map((pos) => {
        const j = jogadores[pos];
        if (!j) return null;
        return (
          <Jogador3D
            key={j.id}
            jogador={j}
            posicao={pos}
            ehVezDele={partida.jogadorDaVez === j.id}
            numCartas={j.cartas.length}
          />
        );
      })}

      {/* Minhas cartas */}
      {jogador && (
        <group position={[0, 0, 4]}>
          {jogador.cartas.map((carta, index) => {
            const offset = (index - 1) * 0.9;
            return (
              <Carta3D
                key={carta.id}
                carta={carta}
                position={[offset, 0.1, 0]}
                rotation={[-Math.PI / 6, 0, 0]}
                selecionada={cartaSelecionada?.id === carta.id}
                onClick={() => handleCartaClick(carta)}
                delay={index * 0.15}
              />
            );
          })}
        </group>
      )}

      {/* Vira */}
      {maoAtual?.vira && (
        <group position={[3.5, 0.1, -2]}>
          <Carta3D
            carta={maoAtual.vira}
            position={[0, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            animarEntrada={false}
          />
          <Text
            position={[0, 0.3, 0.6]}
            fontSize={0.15}
            color="white"
            anchorX="center"
          >
            VIRA
          </Text>
        </group>
      )}
    </>
  );
}

// Componente principal exportado
interface Mesa3DProps {
  partida: Partida;
  jogadorAtual: string;
  cartaSelecionada: CartaType | null;
  onSelecionarCarta: (carta: CartaType | null) => void;
  onJogarCarta: (carta: CartaType) => void;
}

export function Mesa3D(props: Mesa3DProps) {
  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden">
      <Suspense fallback={<LoadingScreen />}>
        <Canvas shadows camera={{ position: [0, 8, 10], fov: 45 }}>
          <color attach="background" args={['#0f4c0f']} />
          <fog attach="fog" args={['#0f4c0f', 15, 30]} />

          <Cena3D {...props} />

          <OrbitControls
            enablePan={false}
            minDistance={8}
            maxDistance={15}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.5}
          />
        </Canvas>
      </Suspense>

      {/* HUD sobreposto */}
      <HUD partida={props.partida} ehMinhaVez={props.partida.jogadorDaVez === props.jogadorAtual} cartaSelecionada={props.cartaSelecionada} />
    </div>
  );
}

// HUD
function HUD({
  partida,
  ehMinhaVez,
  cartaSelecionada,
}: {
  partida: Partida;
  ehMinhaVez: boolean;
  cartaSelecionada: CartaType | null;
}) {
  const maoAtual = partida.maoAtual;

  return (
    <>
      {/* Placar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-4">
        <div className="bg-blue-600/90 backdrop-blur px-4 py-2 rounded-lg text-white font-bold">
          Time A: {partida.times.A.pontos}
        </div>
        <div className="bg-red-600/90 backdrop-blur px-4 py-2 rounded-lg text-white font-bold">
          Time B: {partida.times.B.pontos}
        </div>
      </div>

      {/* Valor do truco */}
      {maoAtual && maoAtual.valorAposta > 1 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 left-4 bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg"
        >
          {maoAtual.valorAposta === 3 && 'TRUCO!'}
          {maoAtual.valorAposta === 6 && 'SEIS!'}
          {maoAtual.valorAposta === 9 && 'NOVE!'}
          {maoAtual.valorAposta === 12 && 'DOZE!'}
        </motion.div>
      )}

      {/* Indicador de vez */}
      {ehMinhaVez && partida.status === 'em_andamento' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-yellow-500/90 backdrop-blur text-black font-semibold px-6 py-3 rounded-full"
        >
          {cartaSelecionada
            ? '🃏 Clique novamente para jogar!'
            : '👆 Sua vez! Selecione uma carta'}
        </motion.div>
      )}
    </>
  );
}
