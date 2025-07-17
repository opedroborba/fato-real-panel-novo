// src/app/login/page.tsx
'use client'; // Necessário para usar hooks como useState

import { useState } from 'react';
import { supabase } from '@/lib/supabase'; // Caminho para sua instância do Supabase
import { useRouter } from 'next/navigation'; // Hook de roteamento do Next.js
import Link from 'next/link'; // Para links internos, se precisar

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log("handleLogin: Tentando login..."); // DEBUG: Mensagem para o console
    e.preventDefault(); // Impede o envio padrão do formulário (que causaria a URL com senha)

    setLoading(true);
    setError(null); // Limpa erros anteriores

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      console.error('Erro no login:', authError.message); // DEBUG: Loga o erro
    } else {
      console.log('Login bem-sucedido! Redirecionando...'); // DEBUG: Mensagem de sucesso
      router.push('/dashboard/noticias'); // Redireciona para o dashboard
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-lg shadow-2xl z-10">
        <div className="text-center">
          {/* Adicionando o logotipo aqui */}
          <img
            src="https://oxwurygnhgaududxrjhe.supabase.co/storage/v1/object/public/capanoticia/capanoticia/Logo-fato-real-sf.png"
            alt="Fato Real Logo"
            className="mx-auto h-24 w-auto mb-4" // Ajuste h-XX para o tamanho desejado e mb-4 para margem inferior
          />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Painel Fato Real {/* Título atualizado aqui */}
          </h2>
        </div>
        {/* Certifique-se de que o método é 'post' e o onSubmit está correto */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin} method="post">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">E-mail</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Lembrar-me</label>
            </div>
            <div className="text-sm">
              <Link href="#" className="font-medium text-indigo-600 hover:text-indigo-500">Esqueceu a senha?</Link>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}