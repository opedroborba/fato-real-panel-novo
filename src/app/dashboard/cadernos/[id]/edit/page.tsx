// src/app/dashboard/cadernos/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Caminho para sua instância Supabase
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Caderno {
  id: number;
  nomecaderno: string;
  ativo: boolean;
}

// Interface para os parâmetros da rota
interface EditCadernoPageProps {
  params: {
    id: string; // O ID do caderno virá da URL
  };
}

export default function EditCadernoPage({ params }: EditCadernoPageProps) {
  const { id } = params; // Pega o ID da URL
  const router = useRouter();

  const [cadernoData, setCadernoData] = useState<Caderno | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false); // Estado para o salvamento

  useEffect(() => {
    const fetchCaderno = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('cadernos')
        .select('id, nomecaderno, ativo')
        .eq('id', id)
        .single(); // Espera apenas um resultado

      if (error) {
        console.error('Erro ao buscar caderno:', error.message);
        setError('Caderno não encontrado ou erro ao carregar: ' + error.message);
        setLoading(false);
        return;
      }
      if (!data) {
        setError('Caderno não encontrado.');
        setLoading(false);
        return;
      }
      setCadernoData(data);
      setLoading(false);
    };

    if (id) {
      fetchCaderno();
    }
  }, [id]); // Dependência do ID da URL

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCadernoData(prevData => {
      if (!prevData) return null;
      return {
        ...prevData,
        [name]: type === 'checkbox' ? checked : value,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!cadernoData || !cadernoData.nomecaderno.trim()) {
      setError('O nome do caderno não pode ser vazio.');
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('cadernos')
      .update({ nomecaderno: cadernoData.nomecaderno, ativo: cadernoData.ativo })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar caderno:', error.message);
      setError('Erro ao atualizar caderno: ' + error.message);
    } else {
      alert('Caderno atualizado com sucesso!');
      router.push('/dashboard/cadernos'); // Redireciona de volta para a lista
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Carregando caderno...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!cadernoData) {
    return null; // Não renderiza nada se os dados ainda não foram carregados ou não existem
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Editar Caderno: {cadernoData.nomecaderno}</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="nomecaderno" className="block text-sm font-medium text-gray-700">
            Nome do Caderno
          </label>
          <input
            type="text"
            id="nomecaderno"
            name="nomecaderno"
            value={cadernoData.nomecaderno}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
            disabled={saving}
          />
        </div>

        <div className="mb-6 flex items-center">
          <input
            type="checkbox"
            id="ativo"
            name="ativo"
            checked={cadernoData.ativo}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={saving}
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
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}