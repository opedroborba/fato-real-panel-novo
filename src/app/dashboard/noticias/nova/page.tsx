// src/app/dashboard/noticias/nova/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image'; // Importar Image para usar

export default function NovaNoticiaPage() {
  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [capaFile, setCapaFile] = useState<File | null>(null);
  const [capaPreviewUrl, setCapaPreviewUrl] = useState<string | null>(null);
  const [idCaderno, setIdCaderno] = useState('');
  const [cadernos, setCadernos] = useState<any[]>([]);
  const [autor, setAutor] = useState('');
  const [publicidade, setPublicidade] = useState(false);
  const [publico, setPublico] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      setError(null);

      const { data: cadernosData, error: cadernosError } = await supabase
        .from('cadernos')
        .select('id, nomecaderno')
        .order('nomecaderno', { ascending: true });

      if (cadernosError) {
        console.error('Erro ao buscar cadernos:', cadernosError.message);
        setError('Erro ao carregar cadernos.');
      } else {
        setCadernos(cadernosData || []);
      }
      setLoading(false);
    }

    fetchInitialData();
  }, []);

  const handleCapaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCapaFile(file);
      setCapaPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!titulo || !conteudo || !idCaderno || !autor) {
      setError('Título, conteúdo, caderno e autor são obrigatórios.');
      setIsSubmitting(false);
      return;
    }

    let capaUrl: string | null = null;
    if (capaFile) {
      const fileExt = capaFile.name.split('.').pop();
      const fileName = `${titulo.replace(/\s+/g, '-')}-${Math.random()}.${fileExt}`;
      const filePath = `noticia_capas/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('capanoticia')
        .upload(filePath, capaFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Erro ao fazer upload da capa:', uploadError.message);
        setError('Erro ao fazer upload da capa: ' + uploadError.message);
        setIsSubmitting(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('capanoticia')
        .getPublicUrl(filePath);
      capaUrl = publicUrlData?.publicUrl || null;
    }

    const { error: insertError } = await supabase
      .from('noticias')
      .insert([{
        titulo,
        subtitulo,
        conteudo,
        capa: capaUrl,
        id_caderno: parseInt(idCaderno),
        autor,
        publicidade,
        publico,
        slug: titulo.toLowerCase().replace(/\s+/g, '-')
      }]);

    if (insertError) {
      console.error('Erro ao criar notícia:', insertError.message);
      setError('Erro ao criar notícia: ' + insertError.message);
    } else {
      alert('Notícia criada com sucesso!');
      router.push('/dashboard/noticias');
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return <div className="p-4">Carregando dados...</div>;
  }

  if (error && !isSubmitting) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Adicionar Nova Notícia</h2>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        {/* Campos de Título, Subtítulo, Conteúdo, Capa, Autor */}
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">Título</label>
          <input
            type="text"
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="subtitulo" className="block text-sm font-medium text-gray-700">Subtítulo (Opcional)</label>
          <input
            type="text"
            id="subtitulo"
            value={subtitulo}
            onChange={(e) => setSubtitulo(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="conteudo" className="block text-sm font-medium text-gray-700">Conteúdo</label>
          <textarea
            id="conteudo"
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            rows={10}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>
        <div>
          <label htmlFor="capa" className="block text-sm font-medium text-gray-700">Capa (Opcional)</label>
          <input
            type="file"
            id="capa"
            accept="image/*"
            onChange={handleCapaChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {capaPreviewUrl && (
            <div className="mt-2">
              <Image src={capaPreviewUrl} alt="Preview da Capa" width={100} height={75} objectFit="cover" className="rounded-md shadow" />
            </div>
          )}
        </div>
        <div>
          <label htmlFor="idCaderno" className="block text-sm font-medium text-gray-700">Caderno</label>
          <select
            id="idCaderno"
            value={idCaderno}
            onChange={(e) => setIdCaderno(e.target.value)}
            required
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
          >
            <option value="">Selecione um Caderno</option>
            {cadernos.map((cad: any) => (
              <option key={cad.id} value={cad.id}>{cad.nomecaderno}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="autor" className="block text-sm font-medium text-gray-700">Autor</label>
          <input
            type="text"
            id="autor"
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center">
          <input
            id="publicidade"
            type="checkbox"
            checked={publicidade}
            onChange={(e) => setPublicidade(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="publicidade" className="ml-2 block text-sm text-gray-900">É Publicidade?</label>
        </div>
        <div className="flex items-center">
          <input
            id="publico"
            type="checkbox"
            checked={publico}
            onChange={(e) => setPublico(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="publico" className="ml-2 block text-sm text-gray-900">Público</label>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <div className="flex justify-end space-x-3">
          <Link href="/dashboard/noticias" className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Cancelar
          </Link>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Criando...' : 'Criar Notícia'}
          </button>
        </div>
      </form>
    </div>
  );
}