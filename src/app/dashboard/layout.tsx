// src/app/dashboard/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Menu Lateral - Voltou para cinza escuro */}
      <aside className="w-64 bg-sidebar-bg text-sidebar-text p-4 flex flex-col shadow-lg">
        {/* Logotipo Fato Real */}
        <div className="mb-8 text-center mt-4">
          <img
            src="https://oxwurygnhgaududxrjhe.supabase.co/storage/v1/object/public/capanoticia/capanoticia/Logo-fato-real-sf.png"
            alt="Fato Real Logo"
            className="mx-auto h-24 w-auto object-contain"
          />
          <p className="mt-2 text-sm text-sidebar-text"> {/* Usei sidebar-text para consistência */}
            Acesse www.fatoreal.com.br
          </p>
        </div>

        {/* Itens do Menu */}
        <nav className="flex-1 space-y-2">
          <Link href="/dashboard/noticias" className={`
              flex items-center p-3 rounded-md text-sm font-medium transition-colors duration-200
              ${pathname.startsWith('/dashboard/noticias') ? 'bg-sidebar-hover text-sidebar-text' : 'hover:bg-sidebar-hover text-sidebar-text'}
            `}>
            <span>Notícias</span>
          </Link>
          <Link href="/dashboard/cadernos" className={`
              flex items-center p-3 rounded-md text-sm font-medium transition-colors duration-200
              ${pathname.startsWith('/dashboard/cadernos') ? 'bg-sidebar-hover text-sidebar-text' : 'hover:bg-sidebar-hover text-sidebar-text'}
            `}>
            <span>Cadernos</span>
          </Link>
          {/* Adicione outros links do menu aqui */}
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}