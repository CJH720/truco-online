'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function RecuperarSenhaPage() {
  const { recuperarSenha, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sucesso = await recuperarSenha(email);
    if (sucesso) {
      setEnviado(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-4">
      <div className="absolute inset-0 bg-[url('/felt-texture.svg')] opacity-20" />

      <Card className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 p-4 rounded-full">
              {enviado ? (
                <CheckCircle className="h-10 w-10 text-white" />
              ) : (
                <Mail className="h-10 w-10 text-white" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            {enviado ? 'E-mail Enviado!' : 'Recuperar Senha'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {enviado
              ? 'Verifique sua caixa de entrada'
              : 'Digite seu e-mail para recuperar sua senha'}
          </CardDescription>
        </CardHeader>

        {enviado ? (
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-lg text-sm text-center">
              <p className="font-medium mb-2">Instruções enviadas para:</p>
              <p className="text-green-800 font-semibold">{email}</p>
              <p className="mt-3 text-xs text-green-600">
                Se não encontrar o e-mail, verifique sua pasta de spam.
              </p>
            </div>

            <div className="pt-4">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full h-12 border-green-600 text-green-600 hover:bg-green-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para o login
                </Button>
              </Link>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-mail cadastrado</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar instruções'
                )}
              </Button>

              <Link href="/login" className="w-full">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para o login
                </Button>
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
