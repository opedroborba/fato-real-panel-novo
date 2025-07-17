// src/app/dashboard/cadernos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Certifique-se de que este caminho está correto
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Caderno {
  id: number;
  nomecaderno: string;
  ativo: boolean; // Assumindo que você tem um campo 'ativo' para desativar/ativar
}

export default function GerenciarCadernosPage() {
  const [cadernos, setCadernos] = useState<Caderno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCadernos();
  }, []);

  const fetchCadernos = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('cadernos')
      .select('id, nomecaderno, ativo') // Selecione as colunas que você tem na sua tabela 'cadernos'
      .order('nomecaderno', { ascending: true }); // Ordena por nome do caderno

    if (error) {
      console.error('Erro ao buscar cadernos:', error.message);
      setError('Erro ao carregar cadernos: ' + error.message);
      setLoading(false);
      return;
    }
    setCadernos(data || []);
    setLoading(false);
  };

  const handleRemoverCaderno = async (id: number) => {
    if (window.confirm('Tem certeza que deseja remover este caderno?')) {
      const { error } = await supabase
        .from('cadernos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover caderno:', error.message);
        alert('Erro ao remover caderno: ' + error.message);
      } else {
        alert('Caderno removido com sucesso!');
        fetchCadernos(); // Atualiza a lista após a remoção
      }
    }
  };

  const handleDesativarAtivarCaderno = async (id: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'ativar' : 'desativar';
    if (window.confirm(`Tem certeza que deseja ${action} este caderno?`)) {
      const { error } = await supabase
        .from('cadernos')
        .update({ ativo: newStatus })
        .eq('id', id);

      if (error) {
        console.error(`Erro ao ${action} caderno:`, error.message);
        alert(`Erro ao ${action} caderno: ` + error.message);
      } else {
        alert(`Caderno ${action} com sucesso!`);
        fetchCadernos(); // Atualiza a lista
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Carregando cadernos...</p>
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

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Gerenciar Cadernos</h2>

      <div className="mb-6 flex justify-between items-center">
        <Link href="/dashboard/cadernos/novo" className="px-4 py-2 bg-fato-yellow text-gray-900 rounded-md hover:bg-fato-yellow-dark transition duration-200 shadow-md">
          Adicionar Novo Caderno
        </Link>
      </div>ç

      {cadernos.length === 0 ? (
        <p className="text-gray-600 text-center">Nenhum caderno encontrado. Adicione um novo!</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome do Caderno
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cadernos.map((caderno) => (
                <tr key={caderno.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {caderno.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {caderno.nomecaderno}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${caderno.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {caderno.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/dashboard/cadernos/${caderno.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDesativarAtivarCaderno(caderno.id, caderno.ativo)}
                      className={`text-sm font-medium ${caderno.ativo ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'} mr-4`}
                    >
                      {caderno.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => handleRemoverCaderno(caderno.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}