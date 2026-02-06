'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useSocket } from '@/contexts/socket-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  Users,
  Coins,
  Lock,
  Unlock,
  Play,
  Search,
  RefreshCw,
  Gamepad2,
  Trophy,
  Target,
  Zap,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Sala } from '@/types/game';

export default function LobbyPage() {
  const router = useRouter();
  const { usuario, _hasHydrated } = useAuthStore();
  const { isConnected, rooms, currentRoom, createRoom, joinRoom, refreshRooms } = useSocket();

  const [busca, setBusca] = useState('');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [codigoSala, setCodigoSala] = useState('');
  const [dialogCodigo, setDialogCodigo] = useState(false);

  // Form for new room
  const [nomeSala, setNomeSala] = useState('');
  const [aposta, setAposta] = useState(50);
  const [privada, setPrivada] = useState(false);
  const [variante, setVariante] = useState<'paulista' | 'mineiro' | 'gaucho'>('paulista');

  // Redirect to room if already in one
  useEffect(() => {
    if (currentRoom) {
      router.push(`/sala/${currentRoom.id}`);
    }
  }, [currentRoom, router]);

  const salasFiltradas = rooms.filter(
    (sala) =>
      sala.nome.toLowerCase().includes(busca.toLowerCase()) &&
      sala.status !== 'jogando'
  );

  const handleCriarSala = () => {
    if (!nomeSala.trim() || !usuario) return;

    createRoom({
      nome: nomeSala,
      criador: usuario.id,
      maxJogadores: 4,
      aposta,
      status: 'aguardando',
      privada,
      variante,
    });

    setDialogAberto(false);
    setNomeSala('');
  };

  const handleEntrarSala = (sala: Sala) => {
    if (sala.jogadores.length >= 4) return;
    if (!usuario) return;
    if (sala.aposta > usuario.fichas) return;

    joinRoom(sala.id);
  };

  const handleEntrarPorCodigo = () => {
    const sala = rooms.find(
      (s) => s.codigo.toUpperCase() === codigoSala.toUpperCase()
    );

    if (sala) {
      handleEntrarSala(sala);
    }
    setDialogCodigo(false);
    setCodigoSala('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Connection Status */}
      <div className="flex items-center justify-end mb-4">
        <Badge
          variant={isConnected ? 'default' : 'destructive'}
          className={isConnected ? 'bg-green-600' : ''}
        >
          {isConnected ? (
            <>
              <Wifi className="h-3 w-3 mr-1" />
              Conectado
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 mr-1" />
              Desconectado
            </>
          )}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white/10 border-white/20 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Gamepad2 className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{usuario?.partidasJogadas || 0}</p>
                <p className="text-sm text-green-200">Partidas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <Trophy className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{usuario?.vitorias || 0}</p>
                <p className="text-sm text-green-200">Vitórias</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Target className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {usuario?.partidasJogadas
                    ? Math.round((usuario.vitorias / usuario.partidasJogadas) * 100)
                    : 0}%
                </p>
                <p className="text-sm text-green-200">Taxa de Vitória</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 border-white/20 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Zap className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">Nível {usuario?.nivel || 1}</p>
                <p className="text-sm text-green-200">{usuario?.experiencia || 0} XP</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-green-600 hover:bg-green-700" disabled={!isConnected}>
              <Plus className="mr-2 h-5 w-5" />
              Criar Sala
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Sala</DialogTitle>
              <DialogDescription>
                Configure sua mesa de Truco e convide seus amigos
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da sala</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Mesa dos Amigos"
                  value={nomeSala}
                  onChange={(e) => setNomeSala(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aposta">Aposta (fichas)</Label>
                <div className="flex gap-2">
                  {[10, 50, 100, 500].map((valor) => (
                    <Button
                      key={valor}
                      type="button"
                      variant={aposta === valor ? 'default' : 'outline'}
                      onClick={() => setAposta(valor)}
                      className={aposta === valor ? 'bg-green-600' : ''}
                    >
                      {valor}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Variante</Label>
                <div className="flex gap-2">
                  {(['paulista', 'mineiro', 'gaucho'] as const).map((v) => (
                    <Button
                      key={v}
                      type="button"
                      variant={variante === v ? 'default' : 'outline'}
                      onClick={() => setVariante(v)}
                      className={variante === v ? 'bg-green-600' : ''}
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={privada ? 'default' : 'outline'}
                  onClick={() => setPrivada(!privada)}
                  className={privada ? 'bg-green-600' : ''}
                >
                  {privada ? (
                    <Lock className="mr-2 h-4 w-4" />
                  ) : (
                    <Unlock className="mr-2 h-4 w-4" />
                  )}
                  {privada ? 'Sala Privada' : 'Sala Pública'}
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogAberto(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCriarSala}
                className="bg-green-600 hover:bg-green-700"
                disabled={!nomeSala.trim()}
              >
                Criar Sala
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={dialogCodigo} onOpenChange={setDialogCodigo}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              variant="outline"
              className="border-green-400 bg-transparent text-green-100 hover:bg-green-700/50 hover:text-white"
              disabled={!isConnected}
            >
              <Search className="mr-2 h-5 w-5" />
              Entrar com Código
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Entrar em Sala Privada</DialogTitle>
              <DialogDescription>
                Digite o código da sala que você recebeu
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Input
                placeholder="Ex: ABC123"
                value={codigoSala}
                onChange={(e) => setCodigoSala(e.target.value.toUpperCase())}
                className="text-center text-2xl font-mono tracking-widest"
                maxLength={6}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogCodigo(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleEntrarPorCodigo}
                className="bg-green-600 hover:bg-green-700"
                disabled={codigoSala.length < 6}
              >
                Entrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Room List */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Salas Disponíveis
              </CardTitle>
              <CardDescription className="text-green-200">
                {salasFiltradas.length} salas abertas
              </CardDescription>
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar sala..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="border-green-400 bg-transparent text-green-100 hover:bg-green-700/50 hover:text-white"
                onClick={refreshRooms}
                disabled={!isConnected}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {!isConnected ? (
                <div className="text-center py-12 text-green-200">
                  <WifiOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Conectando ao servidor...</p>
                  <p className="text-sm">Aguarde um momento</p>
                </div>
              ) : salasFiltradas.length === 0 ? (
                <div className="text-center py-12 text-green-200">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma sala encontrada</p>
                  <p className="text-sm">Crie uma nova sala ou aguarde</p>
                </div>
              ) : (
                salasFiltradas.map((sala) => (
                  <div
                    key={sala.id}
                    className="bg-white/5 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-green-600/20 p-3 rounded-lg">
                        {sala.privada ? (
                          <Lock className="h-6 w-6 text-green-400" />
                        ) : (
                          <Unlock className="h-6 w-6 text-green-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{sala.nome}</h3>
                        <div className="flex items-center gap-3 text-sm text-green-200">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {sala.jogadores.length}/4
                          </span>
                          <span className="flex items-center gap-1">
                            <Coins className="h-3 w-3 text-yellow-400" />
                            {sala.aposta}
                          </span>
                          <Badge
                            variant="secondary"
                            className="bg-green-600/30 text-green-200"
                          >
                            {sala.variante}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleEntrarSala(sala)}
                      disabled={
                        sala.jogadores.length >= 4 ||
                        Boolean(usuario && sala.aposta > usuario.fichas)
                      }
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {sala.jogadores.length >= 4
                        ? 'Lotada'
                        : usuario && sala.aposta > usuario.fichas
                        ? 'Fichas Insuficientes'
                        : 'Entrar'}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
