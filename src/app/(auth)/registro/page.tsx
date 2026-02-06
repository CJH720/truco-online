'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Spade, Gift, Shield, Zap, Star } from 'lucide-react';

export default function RegistroPage() {
  const router = useRouter();
  const { registro, isLoading, error } = useAuthStore();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erroLocal, setErroLocal] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroLocal('');

    if (senha !== confirmarSenha) {
      setErroLocal('As senhas não coincidem');
      return;
    }

    if (senha.length < 6) {
      setErroLocal('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    const sucesso = await registro(nome, email, senha);
    if (sucesso) {
      router.push('/lobby');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Imagem e informações (2/3) */}
      <div className="hidden lg:flex lg:w-2/3 relative bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
        {/* Imagem de fundo */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1511193311914-0346f16efe90?q=80&w=2073"
            alt="Mesa de cartas"
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 via-green-800/70 to-transparent" />
        </div>

        {/* Conteúdo sobreposto */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          <div className="max-w-xl">
            {/* Logo - Click to go to landing page */}
            <Link href="/" className="flex items-center gap-3 mb-8 hover:opacity-90 transition-opacity">
              <div className="bg-white/20 backdrop-blur p-3 rounded-xl">
                <Spade className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">Truco Online</h1>
            </Link>

            {/* Título */}
            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
              Comece sua jornada<br />
              <span className="text-yellow-400">no Truco!</span>
            </h2>

            <p className="text-xl text-green-100 mb-12">
              Crie sua conta gratuita e entre no maior torneio de Truco online do Brasil.
            </p>

            {/* Benefícios */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="bg-yellow-500/20 p-3 rounded-lg">
                  <Gift className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">1.000 fichas grátis</p>
                  <p className="text-green-200 text-sm">Bônus de boas-vindas para novos jogadores</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">Jogo seguro e justo</p>
                  <p className="text-green-200 text-sm">Sistema anti-trapaça avançado</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <Zap className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">Partidas rápidas</p>
                  <p className="text-green-200 text-sm">Encontre oponentes em segundos</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="bg-orange-500/20 p-3 rounded-lg">
                  <Star className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">Ranking competitivo</p>
                  <p className="text-green-200 text-sm">Suba de nível e ganhe recompensas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário (1/3) */}
      <div className="w-full lg:w-1/3 flex items-center justify-center bg-white p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo mobile - Click to go to landing page */}
          <Link href="/" className="flex items-center justify-center gap-3 mb-6 lg:hidden hover:opacity-90 transition-opacity">
            <div className="bg-green-600 p-3 rounded-xl">
              <Spade className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-green-800">Truco Online</h1>
          </Link>

          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Criar conta</h2>
            <p className="text-gray-600">Junte-se à maior comunidade de Truco</p>
          </div>

          {/* Bônus mobile */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-3 mb-6 lg:hidden">
            <Gift className="h-6 w-6 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-800 text-sm">Bônus de Boas-vindas!</p>
              <p className="text-xs text-yellow-700">Ganhe 1.000 fichas grátis</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || erroLocal) && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error || erroLocal}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="nome" className="text-gray-700">Nome de usuário</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Seu apelido"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                minLength={3}
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha" className="text-gray-700">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha" className="text-gray-700">Confirmar senha</Label>
              <Input
                id="confirmarSenha"
                type="password"
                placeholder="Digite a senha novamente"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar minha conta'
              )}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">ou</span>
              </div>
            </div>

            <div className="text-center text-gray-600">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="text-green-600 hover:text-green-700 font-semibold hover:underline"
              >
                Entrar
              </Link>
            </div>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Ao criar uma conta, você concorda com nossos Termos de Uso e Política de Privacidade.
          </p>
        </div>
      </div>
    </div>
  );
}
