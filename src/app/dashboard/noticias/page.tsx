// src/app/dashboard/noticias/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function DashboardNoticiasPage() {
  const [noticias, setNoticias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // --- ESTADOS DOS FILTROS ---
  const [filterCaderno, setFilterCaderno] = useState('');
  const [filterPublico, setFilterPublico] = useState('');
  const [filterAutorInput, setFilterAutorInput] = useState('');
  const [filterAutor, setFilterAutor] = useState('');
  const [cadernosDisponiveis, setCadernosDisponiveis] = useState<any[]>([]);
  // --- FIM DOS ESTADOS DOS FILTROS ---


  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      // Verifica autenticação do usuário
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Usuário não autenticado:', userError?.message);
        router.push('/login');
        return;
      }

      // Fetch Cadernos (para o filtro)
      const { data: cadernosData, error: cadernosError } = await supabase
        .from('cadernos')
        .select('id, nomecaderno');
      if (cadernosError) {
        console.error('Erro ao buscar cadernos:', cadernosError.message);
        setError('Erro ao carregar cadernos para o filtro.');
      } else {
        setCadernosDisponiveis(cadernosData || []);
      }

      let query = supabase
        .from('noticias')
        .select(`
          id,
          created_at,
          titulo,
          subtitulo,
          capa,
          slug,
          id_caderno,
          cadernos (id, nomecaderno),
          updatedat,
          likes,
          publicidade,
          publico,
          autor
        `)
        .order('created_at', { ascending: false });

      // --- APLICAR FILTROS NA QUERY ---
      if (filterCaderno) {
        query = query.eq('id_caderno', filterCaderno);
      }
      if (filterPublico !== '') {
        query = query.eq('publico', filterPublico === 'true');
      }
      if (filterAutor) {
        query = query.ilike('autor', `%${filterAutor}%`);
      }
      // --- FIM DOS FILTROS ---

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar notícias:', error.message);
        setError('Erro ao carregar notícias: ' + error.message);
      } else {
        setNoticias(data || []);
      }
      setLoading(false);
    }

    fetchData();
  }, [router, filterCaderno, filterPublico, filterAutor]);


  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta notícia? Esta ação é irreversível.')) {
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('noticias')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir notícia:', error.message);
      alert('Erro ao excluir notícia: ' + error.message);
      setLoading(false);
    } else {
      alert('Notícia excluída com sucesso!');
      setNoticias(noticias.filter((noticia: any) => noticia.id !== id));
      setLoading(false);
    }
  };

  const handleTogglePublico = async (id: string, currentPublicoStatus: boolean) => {
    setLoading(true);

    const newPublicoStatus = !currentPublicoStatus;

    const { data, error } = await supabase
      .from('noticias')
      .update({ publico: newPublicoStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Erro ao ${newPublicoStatus ? 'publicar' : 'despublicar'} notícia:`, error.message);
      alert(`Erro ao ${newPublicoStatus ? 'publicar' : 'despublicar'} notícia: ` + error.message);
    } else {
      alert(`Notícia ${newPublicoStatus ? 'publicada' : 'despublicada'} com sucesso!`);
      setNoticias(noticias.map((noticia: any) =>
        noticia.id === id ? { ...noticia, publico: newPublicoStatus } : noticia
      ));
    }
    setLoading(false);
  };

  const handleApplyFilters = () => {
    setFilterAutor(filterAutorInput);
  };

  const handleClearFilters = () => {
    setFilterCaderno('');
    setFilterPublico('');
    setFilterAutorInput('');
    setFilterAutor('');
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando notícias...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <Link href="/dashboard/noticias/nova" className="px-4 py-2 bg-fato-rust-yellow text-fato-black rounded-md hover:bg-fato-rust-yellow-dark transition duration-200 shadow-md">
          Adicionar Nova Notícia
        </Link>

        {/* --- SEÇÃO DE FILTROS --- */}
        <div className="flex flex-wrap items-end gap-4 w-full sm:w-auto">
          {/* Filtro por Caderno (Categoria) */}
          <div className="w-full sm:w-auto flex-1 min-w-[150px]">
            <label htmlFor="filterCaderno" className="block text-sm font-medium text-gray-700 mb-1">Caderno</label>
            <select
              id="filterCaderno"
              value={filterCaderno}
              onChange={(e) => setFilterCaderno(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
            >
              <option value="">Todas</option>
              {cadernosDisponiveis.map((cad: any) => (
                <option key={cad.id} value={cad.id}>{cad.nomecaderno}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Publicado */}
          <div className="w-full sm:w-auto flex-1 min-w-[150px]">
            <label htmlFor="filterPublico" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="filterPublico"
              value={filterPublico}
              onChange={(e) => setFilterPublico(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
            >
              <option value="">Todos</option>
              <option value="true">Publicado</option>
              <option value="false">Não Publicado</option>
            </select>
          </div>

          {/* Filtro por Autor com botão */}
          <div className="w-full sm:w-auto flex-1 min-w-[200px]">
            <label htmlFor="filterAutorInput" className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
            <div className="flex">
              <input
                type="text"
                id="filterAutorInput"
                value={filterAutorInput}
                onChange={(e) => setFilterAutorInput(e.target.value)}
                placeholder="Nome do autor"
                className="block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Filtrar
              </button>
            </div>
          </div>
          {/* Botão de Limpar Filtros */}
          <div className="w-full sm:w-auto flex items-end">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md shadow-sm text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              Limpar
            </button>
          </div>
        </div>
        {/* --- FIM DA SEÇÃO DE FILTROS --- */}
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capa
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Título
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Caderno (Categoria)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Autor
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Publicado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {noticias.map((noticia: any) => (
              <tr key={noticia.id}>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {noticia.capa ? (
                    <Image
                      src={noticia.capa}
                      alt={`Capa da notícia: ${noticia.titulo}`}
                      width={60}
                      height={40}
                      layout="fixed"
                      objectFit="cover"
                      className="rounded-md"
                    />
                  ) : (
                    <span className="text-gray-400">Sem capa</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs overflow-hidden text-ellipsis">
                  {noticia.titulo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {noticia.cadernos?.nomecaderno || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {noticia.autor}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleTogglePublico(noticia.id, noticia.publico)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      noticia.publico
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                    disabled={loading}
                  >
                    {noticia.publico ? 'Sim' : 'Não'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/dashboard/noticias/${noticia.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(noticia.id)}
                    className="text-red-600 hover:text-red-900"
                    disabled={loading}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}