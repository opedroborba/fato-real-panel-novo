// src/app/login/page.tsx
'use client' // IMPORTANTE: Esta linha DEVE estar no topo

import { useState } from 'react'
import { supabase } from '@/lib/supabase' // Importa a instância do Supabase que criamos

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      alert('Erro no login: ' + error.message)
      console.error('Erro no login:', error)
    } else {
      window.location.href = '/dashboard' // Redireciona para o dashboard
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="p-8 bg-white rounded-lg shadow-md max-w-md w-full space-y-6">
        <h1 className="text-3xl font-extrabold text-center text-gray-800">Login no Painel Fato Real</h1>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input
            id="email"
            type="email"
            placeholder="seu.email@exemplo.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
          <input
            id="password"
            type="password"
            placeholder="Sua senha secreta"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Entrar
        </button>
      </form>
    </div>
  )
}