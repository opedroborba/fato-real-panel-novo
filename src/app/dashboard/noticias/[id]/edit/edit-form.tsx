// src/app/dashboard/noticias/nova/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export default function NovaNoticiaPage() {
  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [capaFile, setCapaFile] = useState<File | null>(null);
  const [slugInput, setSlugInput] = useState('');
  const [publicidade, setPublicidade] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [autorEmail, setAutorEmail] = useState<string | null>(null); // <-- ALTERAÇÃO AQUI: autorEmail agora
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAutorEmail(user.email || null); // <-- ALTERAÇÃO AQUI: Define o email do autor
        console.log('Email do usuário logado:', user.email);
      } else {
        console.warn('Nenhum usuário logado encontrado. Redirecionando para login.');
        router.push('/login');
      }

      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias')
        .select('id, categoria');

      if (categoriasError) {
        console.error('Erro ao buscar categorias:', categoriasError.message);
        alert('Erro ao carregar categorias.');
      } else {
        setCategorias(categoriasData || []);
      }
      setLoading(false);
    }
    fetchInitialData();
  }, [router]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files[0]) {
      setCapaFile(event.target.files[0]);
    } else {
      setCapaFile(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    if (!autorEmail) { // <-- ALTERAÇÃO AQUI: Verifica autorEmail
      alert('Erro: Email do autor não disponível. Por favor, faça login novamente.');
      setLoading(false);
      return;
    }
    if (!titulo || !subtitulo || !conteudo || !categoriaId || !publicidade) {
      alert('Por favor, preencha todos os campos obrigatórios (Título, Subtítulo, Conteúdo, Categoria, Publicidade).');
      setLoading(false);
      return;
    }

    let capaUrl = '';
    if (capaFile) {
      const fileExtension = capaFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `capanoticia/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('capanoticia')
        .upload(filePath, capaFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Erro ao fazer upload da imagem de capa:', uploadError.message);
        alert('Erro ao fazer upload da imagem de capa: ' + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('capanoticia')
        .getPublicUrl(filePath);

      capaUrl = publicUrlData.publicUrl;
      console.log('URL pública da imagem de capa:', capaUrl);
    } else {
        console.log('Nenhuma imagem de capa selecionada. Capa será vazia.');
        capaUrl = '';
    }

    const slugsArray = slugInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const { data, error } = await supabase
      .from('noticias')
      .insert([
        {
          titulo: titulo,
          subtitulo: subtitulo,
          conteudo: conteudo,
          capa: capaUrl,
          categoria: categoriaId,
          autor: autorEmail, // <-- ALTERAÇÃO AQUI: Insere o email do autor
          slug: slugsArray,
          publicidade: publicidade,
          publico: true,
          likes: [],
        },
      ]);

    if (error) {
      console.error('Erro ao criar notícia:', error);
      alert('Erro ao criar notícia: ' + error.message + '. Verifique o console.');
    } else {
      alert('Notícia criada com sucesso!');
      router.push('/dashboard/noticias');
    }

    setLoading(false);
  }

  if (loading && !autorEmail) { // <-- ALTERAÇÃO AQUI: Verifica autorEmail
    return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Carregando dados do usuário e categorias...</p>
        </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Adicionar Nova Notícia</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">Título</label>
          <input
            type="text"
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>

        <div>
          <label htmlFor="subtitulo" className="block text-sm font-medium text-gray-700">Subtítulo</label>
          <input
            type="text"
            id="subtitulo"
            value={subtitulo}
            onChange={(e) => setSubtitulo(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>

        <div>
          <label htmlFor="conteudo" className="block text-sm font-medium text-gray-700">Conteúdo</label>
          <textarea
            id="conteudo"
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            rows={10}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          ></textarea>
        </div>

        <div>
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">Categoria</label>
          <select
            id="categoria"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
            required
          >
            <option value="">Selecione uma categoria</option>
            {categorias.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.categoria}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="publicidade" className="block text-sm font-medium text-gray-700">Publicidade</label>
          <select
            id="publicidade"
            value={publicidade}
            onChange={(e) => setPublicidade(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
            required
          >
            <option value="">Selecione a posição da publicidade</option>
            <option value="esquerda">Esquerda</option>
            <option value="direita">Direita</option>
            <option value="não">Não</option>
          </select>
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Tags / Palavras-chave (separadas por vírgula)</label>
          <input
            type="text"
            id="slug"
            value={slugInput}
            onChange={(e) => setSlugInput(e.target.value)}
            placeholder="Ex: esporte, futebol, flamengo"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
          <p className="mt-1 text-sm text-gray-500">Use vírgulas para separar as tags.</p>
        </div>

        <div>
          <label htmlFor="capaFile" className="block text-sm font-medium text-gray-700">Imagem de Capa</label>
          <input
            type="file"
            id="capaFile"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
          />
          {capaFile && (
            <p className="mt-2 text-sm text-gray-600">Arquivo selecionado: {capaFile.name}</p>
          )}
          {!capaFile && (
            <p className="mt-1 text-sm text-gray-500">Selecione um arquivo de imagem para a capa.</p>
          )}
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar Notícia'}
        </button>
      </form>
    </div>
  );
}