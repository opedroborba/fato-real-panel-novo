// src/app/dashboard/cadernos/novo/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase'; // Caminho para sua instância Supabase
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NovoCadernoPage() {
  const [nomeCaderno, setNomeCaderno] = useState('');
  const [ativo, setAtivo] = useState(true); // Novo caderno começa como ativo por padrão
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!nomeCaderno.trim()) {
      setError('O nome do caderno não pode ser vazio.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('cadernos')
      .insert({ nomecaderno: nomeCaderno, ativo: ativo }) // Certifique-se que 'nomecaderno' e 'ativo' correspondem às suas colunas
      .select(); // Retorna os dados inseridos

    if (error) {
      console.error('Erro ao adicionar caderno:', error.message);
      setError('Erro ao adicionar caderno: ' + error.message);
    } else {
      alert('Caderno adicionado com sucesso!');
      router.push('/dashboard/cadernos'); // Redireciona de volta para a lista de cadernos
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Adicionar Novo Caderno</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="nomeCaderno" className="block text-sm font-medium text-gray-700">
            Nome do Caderno
          </label>
          <input
            type="text"
            id="nomeCaderno"
            value={nomeCaderno}
            onChange={(e) => setNomeCaderno(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
            disabled={loading}
          />
        </div>

        <div className="mb-6 flex items-center">
          <input
            type="checkbox"
            id="ativo"
            checked={ativo}
            onChange={(e) => setAtivo(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={loading}
          />
          <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
            Ativo
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/dashboard/cadernos" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition duration-200 shadow-sm">
            Cancelar
          </Link>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 shadow-md"
            disabled={loading}
          >
            {loading ? 'Adicionando...' : 'Adicionar Caderno'}
          </button>
        </div>
      </form>
    </div>
  );
}