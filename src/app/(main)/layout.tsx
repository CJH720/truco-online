'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Header } from '@/components/layout/header';
import { SocketProvider } from '@/contexts/socket-context';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { usuario, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // Only redirect after hydration is complete to avoid false redirects
    if (_hasHydrated && !usuario) {
      router.push('/login');
    }
  }, [usuario, _hasHydrated, router]);

  // Show loading while hydrating
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  // After hydration, if no user, show loading (redirect will happen)
  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  return (
    <SocketProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
        <Header />
        <main>{children}</main>
      </div>
    </SocketProvider>
  );
}
