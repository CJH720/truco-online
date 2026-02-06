'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Spade, Users, Trophy, Gamepad2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sucesso = await login(email, senha);
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
            src="https://images.unsplash.com/photo-1541278107931-e006523892df?q=80&w=2071"
            alt="Cartas de baralho"
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
              O melhor jogo de<br />
              <span className="text-yellow-400">Truco do Brasil</span>
            </h2>

            <p className="text-xl text-green-100 mb-12">
              Jogue com amigos ou encontre novos parceiros.
              Dispute partidas emocionantes e suba no ranking!
            </p>

            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                <Users className="h-8 w-8 text-green-300 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">50K+</p>
                <p className="text-green-200 text-sm">Jogadores</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                <Gamepad2 className="h-8 w-8 text-green-300 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">1M+</p>
                <p className="text-green-200 text-sm">Partidas</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">100+</p>
                <p className="text-green-200 text-sm">Torneios</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário (1/3) */}
      <div className="w-full lg:w-1/3 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          {/* Logo mobile - Click to go to landing page */}
          <Link href="/" className="flex items-center justify-center gap-3 mb-8 lg:hidden hover:opacity-90 transition-opacity">
            <div className="bg-green-600 p-3 rounded-xl">
              <Spade className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-green-800">Truco Online</h1>
          </Link>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo de volta!</h2>
            <p className="text-gray-600">Entre na sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

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
              <div className="flex justify-between items-center">
                <Label htmlFor="senha" className="text-gray-700">Senha</Label>
                <Link
                  href="/recuperar-senha"
                  className="text-sm text-green-600 hover:text-green-700 hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
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
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">ou</span>
              </div>
            </div>

            <div className="text-center text-gray-600">
              Não tem uma conta?{' '}
              <Link
                href="/registro"
                className="text-green-600 hover:text-green-700 font-semibold hover:underline"
              >
                Criar conta grátis
              </Link>
            </div>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-8">
            Ao entrar, você concorda com nossos Termos de Uso e Política de Privacidade.
          </p>
        </div>
      </div>
    </div>
  );
}
