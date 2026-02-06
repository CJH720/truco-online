// Store de autenticação - Connected to PostgreSQL database via Prisma

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Usuario } from '@/types/game';

interface AuthState {
  usuario: Usuario | null;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;

  // Actions
  login: (email: string, senha: string) => Promise<boolean>;
  registro: (nome: string, email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  recuperarSenha: (email: string) => Promise<boolean>;
  atualizarPerfil: (dados: Partial<Usuario>) => Promise<void>;
  adicionarFichas: (quantidade: number) => Promise<void>;
  removerFichas: (quantidade: number) => Promise<boolean>;
  adicionarExperiencia: (xp: number) => Promise<void>;
  refreshUser: () => Promise<void>;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      login: async (email, senha) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha }),
          });

          const data = await response.json();

          if (!response.ok) {
            set({ isLoading: false, error: data.error || 'Erro ao fazer login' });
            return false;
          }

          // Convert date string to Date object
          const usuario: Usuario = {
            ...data.user,
            criadoEm: new Date(data.user.criadoEm),
          };

          set({ usuario, isLoading: false });
          return true;
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false, error: 'Erro de conexão. Tente novamente.' });
          return false;
        }
      },

      registro: async (nome, email, senha) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/auth/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha }),
          });

          const data = await response.json();

          if (!response.ok) {
            set({ isLoading: false, error: data.error || 'Erro ao criar conta' });
            return false;
          }

          // Convert date string to Date object
          const usuario: Usuario = {
            ...data.user,
            criadoEm: new Date(data.user.criadoEm),
          };

          set({ usuario, isLoading: false });
          return true;
        } catch (error) {
          console.error('Registration error:', error);
          set({ isLoading: false, error: 'Erro de conexão. Tente novamente.' });
          return false;
        }
      },

      logout: () => {
        set({ usuario: null, error: null });
      },

      recuperarSenha: async (email) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/auth/recuperar-senha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });

          const data = await response.json();

          if (!response.ok) {
            set({ isLoading: false, error: data.error || 'Erro ao recuperar senha' });
            return false;
          }

          set({ isLoading: false });
          return true;
        } catch (error) {
          console.error('Password recovery error:', error);
          set({ isLoading: false, error: 'Erro de conexão. Tente novamente.' });
          return false;
        }
      },

      atualizarPerfil: async (dados) => {
        const { usuario } = get();
        if (!usuario) return;

        try {
          const response = await fetch(`/api/users/${usuario.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados),
          });

          const data = await response.json();

          if (response.ok) {
            const usuarioAtualizado: Usuario = {
              ...data.user,
              criadoEm: new Date(data.user.criadoEm),
            };
            set({ usuario: usuarioAtualizado });
          }
        } catch (error) {
          console.error('Profile update error:', error);
        }
      },

      adicionarFichas: async (quantidade) => {
        const { usuario, atualizarPerfil } = get();
        if (!usuario) return;

        const novasFichas = usuario.fichas + quantidade;
        // Optimistic update
        set({ usuario: { ...usuario, fichas: novasFichas } });
        // Sync with database
        await atualizarPerfil({ fichas: novasFichas });
      },

      removerFichas: async (quantidade) => {
        const { usuario, atualizarPerfil } = get();
        if (!usuario) return false;

        if (usuario.fichas < quantidade) return false;

        const novasFichas = usuario.fichas - quantidade;
        // Optimistic update
        set({ usuario: { ...usuario, fichas: novasFichas } });
        // Sync with database
        await atualizarPerfil({ fichas: novasFichas });
        return true;
      },

      adicionarExperiencia: async (xp) => {
        const { usuario, atualizarPerfil } = get();
        if (!usuario) return;

        let novaExp = usuario.experiencia + xp;
        let novoNivel = usuario.nivel;

        // Level system: 100 XP per level
        while (novaExp >= novoNivel * 100) {
          novaExp -= novoNivel * 100;
          novoNivel++;
        }

        // Optimistic update
        set({
          usuario: {
            ...usuario,
            experiencia: novaExp,
            nivel: novoNivel,
          },
        });

        // Sync with database
        await atualizarPerfil({ experiencia: novaExp, nivel: novoNivel });
      },

      refreshUser: async () => {
        const { usuario } = get();
        if (!usuario) return;

        try {
          const response = await fetch(`/api/users/${usuario.id}`);
          const data = await response.json();

          if (response.ok) {
            const usuarioAtualizado: Usuario = {
              ...data.user,
              criadoEm: new Date(data.user.criadoEm),
            };
            set({ usuario: usuarioAtualizado });
          }
        } catch (error) {
          console.error('Refresh user error:', error);
        }
      },
    }),
    {
      name: 'truco-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ usuario: state.usuario }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
