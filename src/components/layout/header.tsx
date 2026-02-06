'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useGameStore } from '@/stores/game-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Spade,
  Coins,
  Trophy,
  User,
  LogOut,
  Volume2,
  VolumeX,
  Menu,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Header() {
  const router = useRouter();
  const { usuario, logout } = useAuthStore();
  const { somAtivo, toggleSom } = useGameStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!usuario) return null;

  return (
    <header className="bg-green-800 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Click to go to landing page */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-white/10 p-2 rounded-lg">
              <Spade className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">
              Truco Online
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/lobby"
              className="text-green-100 hover:text-white transition-colors"
            >
              Lobby
            </Link>
            <Link
              href="/ranking"
              className="text-green-100 hover:text-white transition-colors"
            >
              Ranking
            </Link>
          </nav>

          {/* User Info & Actions */}
          <div className="flex items-center gap-3">
            {/* Fichas */}
            <div className="hidden sm:flex items-center gap-2 bg-yellow-500/20 px-3 py-1.5 rounded-full">
              <Coins className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-100 font-semibold">
                {usuario.fichas.toLocaleString()}
              </span>
            </div>

            {/* Nível */}
            <Badge
              variant="secondary"
              className="hidden sm:flex bg-green-600/50 text-green-100 hover:bg-green-600/50"
            >
              <Trophy className="h-3 w-3 mr-1" />
              Nível {usuario.nivel}
            </Badge>

            {/* Som Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSom}
              className="text-green-100 hover:text-white hover:bg-green-700"
            >
              {somAtivo ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10 border-2 border-green-400">
                    <AvatarImage src={usuario.avatar} alt={usuario.nome} />
                    <AvatarFallback className="bg-green-600 text-white">
                      {getInitials(usuario.nome)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{usuario.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {usuario.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Mobile: Fichas */}
                <DropdownMenuItem className="sm:hidden">
                  <Coins className="mr-2 h-4 w-4 text-yellow-500" />
                  <span>{usuario.fichas.toLocaleString()} fichas</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => router.push('/perfil')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Meu Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/ranking')}>
                  <Trophy className="mr-2 h-4 w-4" />
                  <span>Ranking</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-green-100 hover:text-white hover:bg-green-700"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link
                    href="/lobby"
                    className="flex items-center gap-2 text-lg font-medium"
                  >
                    <Spade className="h-5 w-5" />
                    Lobby
                  </Link>
                  <Link
                    href="/ranking"
                    className="flex items-center gap-2 text-lg font-medium"
                  >
                    <Trophy className="h-5 w-5" />
                    Ranking
                  </Link>
                  <Link
                    href="/perfil"
                    className="flex items-center gap-2 text-lg font-medium"
                  >
                    <User className="h-5 w-5" />
                    Meu Perfil
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
