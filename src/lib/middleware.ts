// middleware.ts
import { createMiddlewareClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ request, response });

  // Refresh the user's session and get their auth token
  // Isso é importante para manter a sessão sincronizada e acessível
  // tanto no lado do servidor quanto no cliente.
  await supabase.auth.getSession();

  return response;
}

// Define quais rotas o middleware deve ser executado
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Todas as rotas da API que você não quer que sejam protegidas (se houver)
     * - Rotas de autenticação (login, signup, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};