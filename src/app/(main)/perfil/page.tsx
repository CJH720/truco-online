'use client';

import { useState, useRef } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Mail,
  Coins,
  Trophy,
  Target,
  Gamepad2,
  Star,
  TrendingUp,
  Calendar,
  Edit,
  Save,
  X,
  Award,
  Zap,
  Camera,
  Loader2,
} from 'lucide-react';

// Componente de progresso personalizado simples
function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={`h-2 bg-white/20 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-green-500 transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default function PerfilPage() {
  const { usuario, atualizarPerfil } = useAuthStore();
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(usuario?.nome || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!usuario) return null;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        await atualizarPerfil({ avatar: base64String });
        toast.success('Avatar atualizado!');
        setUploadingAvatar(false);
      };
      reader.onerror = () => {
        toast.error('Erro ao processar imagem');
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('Erro ao atualizar avatar');
      setUploadingAvatar(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getInitials = (nome: string) => {
    return nome.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const taxaVitoria = usuario.partidasJogadas > 0
    ? Math.round((usuario.vitorias / usuario.partidasJogadas) * 100)
    : 0;

  const xpParaProximoNivel = usuario.nivel * 100;
  const progressoNivel = (usuario.experiencia / xpParaProximoNivel) * 100;

  const handleSalvar = () => {
    if (nome.trim().length < 3) {
      toast.error('O nome deve ter pelo menos 3 caracteres');
      return;
    }

    atualizarPerfil({ nome: nome.trim() });
    setEditando(false);
    toast.success('Perfil atualizado!');
  };

  const conquistas = [
    { nome: 'Primeira Vitória', descricao: 'Vença sua primeira partida', icon: Trophy, desbloqueada: usuario.vitorias >= 1 },
    { nome: '10 Vitórias', descricao: 'Acumule 10 vitórias', icon: Award, desbloqueada: usuario.vitorias >= 10 },
    { nome: 'Veterano', descricao: 'Jogue 50 partidas', icon: Gamepad2, desbloqueada: usuario.partidasJogadas >= 50 },
    { nome: 'Mestre do Truco', descricao: 'Alcance o nível 10', icon: Star, desbloqueada: usuario.nivel >= 10 },
    { nome: 'Rico', descricao: 'Acumule 10.000 fichas', icon: Coins, desbloqueada: usuario.fichas >= 10000 },
    { nome: 'Imbatível', descricao: 'Vença 5 partidas seguidas', icon: Zap, desbloqueada: false },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Perfil principal */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white/10 border-white/20">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                {/* Avatar with upload button */}
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-green-500">
                    <AvatarImage src={usuario.avatar} alt={usuario.nome} />
                    <AvatarFallback className="bg-green-600 text-white text-2xl">
                      {getInitials(usuario.nome)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Upload overlay */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    ) : (
                      <Camera className="h-8 w-8 text-white" />
                    )}
                  </button>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                <p className="text-xs text-green-300/70 mt-2">Clique para alterar</p>

                {editando ? (
                  <div className="mt-4 w-full space-y-3">
                    <Input
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="text-center bg-white/10 border-white/20 text-white"
                      placeholder="Seu nome"
                    />
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" onClick={handleSalvar} className="bg-green-600">
                        <Save className="h-4 w-4 mr-1" />
                        Salvar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditando(false);
                          setNome(usuario.nome);
                        }}
                        className="text-white"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-white mt-4 flex items-center gap-2">
                      {usuario.nome}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-green-300 hover:text-white"
                        onClick={() => setEditando(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </h2>
                    <p className="text-green-300 flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {usuario.email}
                    </p>
                  </>
                )}

                {/* Nível e XP */}
                <div className="w-full mt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-300">Nível {usuario.nivel}</span>
                    <span className="text-green-300">
                      {usuario.experiencia}/{xpParaProximoNivel} XP
                    </span>
                  </div>
                  <ProgressBar value={progressoNivel} />
                </div>

                {/* Fichas */}
                <div className="mt-6 bg-yellow-500/20 rounded-lg p-4 w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-300 flex items-center gap-2">
                      <Coins className="h-5 w-5" />
                      Fichas
                    </span>
                    <span className="text-2xl font-bold text-yellow-400">
                      {usuario.fichas.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Data de cadastro */}
                <div className="mt-4 text-sm text-green-400 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Membro desde {new Date(usuario.criadoEm).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas e conquistas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Estatísticas */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <Gamepad2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {usuario.partidasJogadas}
                  </p>
                  <p className="text-green-300 text-sm">Partidas</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{usuario.vitorias}</p>
                  <p className="text-green-300 text-sm">Vitórias</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <Target className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{taxaVitoria}%</p>
                  <p className="text-green-300 text-sm">Taxa de Vitória</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <Star className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{usuario.nivel}</p>
                  <p className="text-green-300 text-sm">Nível</p>
                </div>
              </div>

              {/* Gráfico de vitórias/derrotas */}
              <div className="mt-6">
                <h4 className="text-white font-medium mb-3">Desempenho</h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-400">Vitórias</span>
                      <span className="text-green-400">{usuario.vitorias}</span>
                    </div>
                    <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                        style={{
                          width: `${
                            usuario.partidasJogadas > 0
                              ? (usuario.vitorias / usuario.partidasJogadas) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-red-400">Derrotas</span>
                      <span className="text-red-400">{usuario.derrotas}</span>
                    </div>
                    <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                        style={{
                          width: `${
                            usuario.partidasJogadas > 0
                              ? (usuario.derrotas / usuario.partidasJogadas) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conquistas */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="h-5 w-5" />
                Conquistas
              </CardTitle>
              <CardDescription className="text-green-300">
                {conquistas.filter((c) => c.desbloqueada).length} de{' '}
                {conquistas.length} desbloqueadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {conquistas.map((conquista) => {
                  const Icon = conquista.icon;
                  return (
                    <div
                      key={conquista.nome}
                      className={`rounded-lg p-4 border transition-all ${
                        conquista.desbloqueada
                          ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-yellow-500/30'
                          : 'bg-white/5 border-white/10 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            conquista.desbloqueada
                              ? 'bg-yellow-500/20'
                              : 'bg-white/10'
                          }`}
                        >
                          <Icon
                            className={`h-6 w-6 ${
                              conquista.desbloqueada
                                ? 'text-yellow-400'
                                : 'text-gray-400'
                            }`}
                          />
                        </div>
                        <div>
                          <p
                            className={`font-medium ${
                              conquista.desbloqueada
                                ? 'text-white'
                                : 'text-gray-400'
                            }`}
                          >
                            {conquista.nome}
                          </p>
                          <p className="text-xs text-green-300/70">
                            {conquista.descricao}
                          </p>
                        </div>
                      </div>
                      {conquista.desbloqueada && (
                        <Badge className="mt-2 bg-yellow-500/20 text-yellow-300 text-xs">
                          Desbloqueada
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
