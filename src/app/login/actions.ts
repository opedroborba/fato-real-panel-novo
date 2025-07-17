// src/app/login/actions.ts
'use server'; // Indica que este arquivo contém Server Actions

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Função para criar uma instância do cliente Supabase para o servidor
// Ele lê e escreve cookies para gerenciar a sessão
function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (e) {
            // Este é um workaround para o Next.js 14+ com redirect() em Server Actions.
            // O `cookies().set()` pode dar erro se há um `redirect()` no mesmo action.
            // O cookie será setado na próxima requisição, após o redirect.
            // Não faça nada aqui, o erro é esperado e não impede o fluxo.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (e) {
            // Similar ao set, erro esperado com redirect.
          }
        },
      },
    }
  );
}

// Server Action para lidar com o login
// ESTA É A VERSÃO CORRETA E ÚNICA DA FUNÇÃO signIn
export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // LOG: Verifique os dados recebidos pelo Server Action
  console.log('Server Action: Tentando login para email:', email);

  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // LOG: Loga o erro COMPLETO do Supabase no terminal
    console.error('ERRO DETALHADO DO SUPABASE (Server Terminal):', error);
    redirect(`/login?message=${error.message}`);
  }

  // LOG: Se chegar aqui, significa que o login "sucededeu" para o Supabase
  console.log('Login bem-sucedido no Server Action! Usuário:', data.user?.email);
  redirect('/dashboard');
}

// Server Action para lidar com o logout (opcional, mas bom ter)
export async function signOut() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}