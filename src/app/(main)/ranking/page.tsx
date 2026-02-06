'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Trophy,
  Medal,
  Crown,
  Gamepad2,
  Coins,
  Star,
  Loader2,
} from 'lucide-react';
import { Usuario } from '@/types/game';
import { cn } from '@/lib/utils';

interface RankingItem {
  posicao: number;
  usuario: Omit<Usuario, 'email' | 'criadoEm'>;
  pontuacao: number;
}

export default function RankingPage() {
  const { usuario } = useAuthStore();
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [periodo, setPeriodo] = useState<'semanal' | 'mensal' | 'geral'>('geral');

  const fetchRanking = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/ranking?limit=50&orderBy=vitorias`);
      const data = await response.json();

      if (response.ok && data.ranking) {
        setRanking(data.ranking);
      }
    } catch (error) {
      console.error('Failed to fetch ranking:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRanking();
  }, [periodo, fetchRanking]);

  const getInitials = (nome: string) => {
    return nome.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const calcularTaxaVitoria = (vitorias: number, partidas: number) => {
    if (partidas === 0) return 0;
    return Math.round((vitorias / partidas) * 100);
  };

  const getPosicaoIcon = (posicao: number) => {
    switch (posicao) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-green-300">{posicao}</span>;
    }
  };

  const getPosicaoBg = (posicao: number) => {
    switch (posicao) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/30';
      default:
        return 'bg-white/5 border-white/10';
    }
  };

  // Find current user's position
  const minhaPosicao = usuario
    ? ranking.find((r) => r.usuario.id === usuario.id)?.posicao || ranking.length + 1
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-400" />
          Ranking de Jogadores
        </h1>
        <p className="text-green-200 mt-2">
          Os melhores jogadores de Truco Online
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Ranking principal */}
        <div className="lg:col-span-3">
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-white">Top Jogadores</CardTitle>
                <Tabs value={periodo} onValueChange={(v) => setPeriodo(v as 'semanal' | 'mensal' | 'geral')}>
                  <TabsList className="bg-white/10">
                    <TabsTrigger
                      value="semanal"
                      className="text-white data-[state=active]:bg-green-600 data-[state=active]:text-white"
                    >
                      Semanal
                    </TabsTrigger>
                    <TabsTrigger
                      value="mensal"
                      className="text-white data-[state=active]:bg-green-600 data-[state=active]:text-white"
                    >
                      Mensal
                    </TabsTrigger>
                    <TabsTrigger
                      value="geral"
                      className="text-white data-[state=active]:bg-green-600 data-[state=active]:text-white"
                    >
                      Geral
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-[500px]">
                  <Loader2 className="h-8 w-8 animate-spin text-green-400" />
                </div>
              ) : ranking.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[500px] text-green-300">
                  <Trophy className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg">Nenhum jogador no ranking ainda</p>
                  <p className="text-sm">Seja o primeiro a jogar!</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {ranking.map((item) => {
                      const jogador = item.usuario;
                      const posicao = item.posicao;
                      const ehEu = usuario?.id === jogador.id;
                      const taxaVitoria = calcularTaxaVitoria(
                        jogador.vitorias,
                        jogador.partidasJogadas
                      );

                      return (
                        <div
                          key={jogador.id}
                          className={cn(
                            'flex items-center gap-4 p-4 rounded-lg border transition-all',
                            getPosicaoBg(posicao),
                            ehEu && 'ring-2 ring-green-400'
                          )}
                        >
                          {/* Posição */}
                          <div className="w-10 flex justify-center">
                            {getPosicaoIcon(posicao)}
                          </div>

                          {/* Avatar e nome */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Avatar className="h-12 w-12 border-2 border-white/30">
                              <AvatarFallback className="bg-green-600 text-white">
                                {getInitials(jogador.nome)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-white font-semibold truncate flex items-center gap-2">
                                {jogador.nome}
                                {ehEu && (
                                  <Badge className="bg-green-600 text-xs">Você</Badge>
                                )}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-green-300">
                                <Star className="h-3 w-3" />
                                Nível {jogador.nivel}
                              </div>
                            </div>
                          </div>

                          {/* Estatísticas */}
                          <div className="hidden sm:flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <p className="text-green-300">Vitórias</p>
                              <p className="text-white font-bold">{jogador.vitorias}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-green-300">Taxa</p>
                              <p className="text-white font-bold">{taxaVitoria}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-green-300">Fichas</p>
                              <p className="text-yellow-400 font-bold">
                                {jogador.fichas.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Mobile stats */}
                          <div className="sm:hidden text-right">
                            <p className="text-yellow-400 font-bold">
                              {jogador.fichas.toLocaleString()}
                            </p>
                            <p className="text-green-300 text-xs">
                              {taxaVitoria}% vitórias
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Minha posição */}
          {usuario && (
            <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">Sua Posição</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-5xl font-bold text-yellow-400 mb-2">
                    #{minhaPosicao}
                  </div>
                  <p className="text-green-200 text-sm">
                    de {ranking.length} jogadores
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-green-300">Vitórias</span>
                    <span className="text-white font-semibold">
                      {usuario.vitorias}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-300">Partidas</span>
                    <span className="text-white font-semibold">
                      {usuario.partidasJogadas}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-300">Taxa</span>
                    <span className="text-white font-semibold">
                      {calcularTaxaVitoria(
                        usuario.vitorias,
                        usuario.partidasJogadas
                      )}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top 3 */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-400" />
                Pódio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-end gap-4 h-32">
                {/* 2º lugar */}
                <div className="flex flex-col items-center">
                  <Avatar className="h-12 w-12 border-2 border-gray-400">
                    <AvatarFallback className="bg-gray-600 text-white">
                      {ranking[1] && getInitials(ranking[1].usuario.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-500/30 w-16 h-16 flex items-center justify-center mt-2 rounded-t-lg">
                    <span className="text-2xl font-bold text-gray-300">2</span>
                  </div>
                </div>

                {/* 1º lugar */}
                <div className="flex flex-col items-center -mt-4">
                  <Crown className="h-6 w-6 text-yellow-400 mb-1" />
                  <Avatar className="h-14 w-14 border-2 border-yellow-400">
                    <AvatarFallback className="bg-yellow-600 text-white">
                      {ranking[0] && getInitials(ranking[0].usuario.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-yellow-500/30 w-16 h-24 flex items-center justify-center mt-2 rounded-t-lg">
                    <span className="text-3xl font-bold text-yellow-400">1</span>
                  </div>
                </div>

                {/* 3º lugar */}
                <div className="flex flex-col items-center">
                  <Avatar className="h-12 w-12 border-2 border-amber-600">
                    <AvatarFallback className="bg-amber-700 text-white">
                      {ranking[2] && getInitials(ranking[2].usuario.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-amber-600/30 w-16 h-12 flex items-center justify-center mt-2 rounded-t-lg">
                    <span className="text-2xl font-bold text-amber-500">3</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas globais */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-lg">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <Gamepad2 className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">12.453</p>
                  <p className="text-green-300 text-sm">Partidas hoje</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">3.891</p>
                  <p className="text-green-300 text-sm">Jogadores online</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-yellow-500/20 p-2 rounded-lg">
                  <Coins className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">2.5M</p>
                  <p className="text-green-300 text-sm">Fichas em jogo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Import Users icon that was missing
function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
