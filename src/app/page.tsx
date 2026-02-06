'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Spade,
  Users,
  Trophy,
  Zap,
  Shield,
  Smartphone,
  Gamepad2,
  Star,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { usuario } = useAuthStore();

  useEffect(() => {
    if (usuario) {
      router.push('/lobby');
    }
  }, [usuario, router]);

  const recursos = [
    {
      icon: Users,
      titulo: 'Multiplayer em Tempo Real',
      descricao: 'Jogue com amigos ou encontre oponentes online instantaneamente',
    },
    {
      icon: Trophy,
      titulo: 'Sistema de Ranking',
      descricao: 'Suba no ranking e mostre que você é o melhor trucador',
    },
    {
      icon: Zap,
      titulo: 'Partidas Rápidas',
      descricao: 'Entre em uma partida em segundos, sem complicação',
    },
    {
      icon: Shield,
      titulo: 'Jogo Seguro',
      descricao: 'Sistema anti-trapaça para garantir partidas justas',
    },
    {
      icon: Smartphone,
      titulo: 'Responsivo',
      descricao: 'Jogue no computador, tablet ou celular',
    },
    {
      icon: Star,
      titulo: 'Conquistas',
      descricao: 'Desbloqueie conquistas e mostre sua experiência',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background image - people playing cards */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1541278107931-e006523892df?q=80&w=2071"
            alt="People playing cards"
            fill
            className="object-cover opacity-25"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/60 via-green-800/70 to-green-900" />

        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-green-600 p-6 rounded-full shadow-2xl">
                <Spade className="h-16 w-16 text-white" />
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Truco Online
            </h1>

            <p className="text-xl md:text-2xl text-green-200 max-w-2xl mx-auto mb-10">
              O melhor jogo de Truco online do Brasil. Jogue com amigos, suba no
              ranking e prove que você é o melhor!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/registro">
                <Button
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg px-8 py-6 shadow-lg"
                >
                  <Gamepad2 className="mr-2 h-6 w-6" />
                  Jogar Agora - É Grátis!
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-green-400 bg-transparent text-green-100 hover:bg-green-700/50 hover:text-white text-lg px-8 py-6"
                >
                  Já tenho conta
                </Button>
              </Link>
            </div>

            {/* Estatísticas */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div>
                <p className="text-4xl font-bold text-yellow-400">50K+</p>
                <p className="text-green-300">Jogadores</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-yellow-400">1M+</p>
                <p className="text-green-300">Partidas</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-yellow-400">4.8</p>
                <p className="text-green-300">Avaliação</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating decorative cards with real card images */}
        <motion.div
          className="absolute top-20 left-10 rotate-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Image
            src="/cards/ace_of_spades.svg"
            alt="Ace of Spades"
            width={80}
            height={112}
            className="drop-shadow-2xl"
          />
        </motion.div>
        <motion.div
          className="absolute top-40 right-20 -rotate-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Image
            src="/cards/king_of_hearts.svg"
            alt="King of Hearts"
            width={80}
            height={112}
            className="drop-shadow-2xl"
          />
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-1/4 rotate-45"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.5, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Image
            src="/cards/queen_of_diamonds.svg"
            alt="Queen of Diamonds"
            width={100}
            height={140}
            className="drop-shadow-2xl"
          />
        </motion.div>
        {/* Additional cards for visual richness */}
        <motion.div
          className="absolute top-1/3 right-1/4 -rotate-6 hidden lg:block"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 0.6, x: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Image
            src="/cards/jack_of_clubs.svg"
            alt="Jack of Clubs"
            width={70}
            height={98}
            className="drop-shadow-2xl"
          />
        </motion.div>
        <motion.div
          className="absolute bottom-1/3 right-10 rotate-20 hidden md:block"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 0.5, x: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <Image
            src="/cards/7_of_hearts.svg"
            alt="7 of Hearts"
            width={60}
            height={84}
            className="drop-shadow-2xl"
          />
        </motion.div>
      </div>

      {/* Recursos */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Por que jogar Truco Online?
          </h2>
          <p className="text-green-200 text-lg">
            Tudo que você precisa para se divertir com o melhor jogo de cartas do Brasil
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recursos.map((recurso, index) => {
            const Icon = recurso.icon;
            return (
              <motion.div
                key={recurso.titulo}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-colors h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-green-600/30 p-3 rounded-lg flex-shrink-0">
                        <Icon className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg mb-2">
                          {recurso.titulo}
                        </h3>
                        <p className="text-green-200 text-sm">
                          {recurso.descricao}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CTA Final */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 md:p-12 text-center shadow-2xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para mostrar suas habilidades?
          </h2>
          <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
            Crie sua conta gratuita agora e ganhe 1.000 fichas de bônus para começar a jogar!
          </p>
          <Link href="/registro">
            <Button
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg px-10 py-6"
            >
              Criar Conta Grátis
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-green-300 text-sm">
          <p>© 2024 Truco Online. Todos os direitos reservados.</p>
          <p className="mt-2">Feito com ♠ ♥ ♦ ♣ para os amantes de Truco</p>
        </div>
      </footer>
    </div>
  );
}
