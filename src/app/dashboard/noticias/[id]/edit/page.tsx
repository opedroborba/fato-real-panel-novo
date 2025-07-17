// src/app/dashboard/noticias/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation'; // Importa useParams
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic'; // Importa dynamic para SSR
import 'react-quill/dist/quill.snow.css'; // Importa o CSS do Quill

// Componente ReactQuill carregado dinamicamente para desativar SSR
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function EditNoticiaPage() {
  // Obtém os parâmetros da rota usando o hook useParams
  const params = useParams();
  const noticiaId = params.id as string; // Acessa o ID da notícia

  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [conteudo, setConteudo] = useState(''); // Conteúdo do editor de rich text
  const [capaFile, setCapaFile] = useState<File | null>(null);
  const [capaPreviewUrl, setCapaPreviewUrl] = useState<string | null>(null);
  const [currentCapaUrl, setCurrentCapaUrl] = useState<string | null>(null); // URL da capa atual do DB
  const [idCaderno, setIdCaderno] = useState('');
  const [cadernos, setCadernos] = useState<any[]>([]); // Lista de cadernos para o dropdown
  const [autor, setAutor] = useState('');
  const [publicidade, setPublicidade] = useState(false);
  const [publico, setPublico] = useState(true);
  const [slugInput, setSlugInput] = useState(''); // Para editar as tags/slugs
  const [loading, setLoading] = useState(true); // Estado de carregamento inicial
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado de envio do formulário
  const [error, setError] = useState<string | null>(null); // Mensagens de erro
  const router = useRouter(); // Hook para navegação

  // useEffect para buscar os dados da notícia e os cadernos disponíveis
  useEffect(() => {
    async function fetchNoticiaAndCadernos() {
      setLoading(true);
      setError(null);

      // 1. Busca os cadernos para popular o dropdown
      const { data: cadernosData, error: cadernosError } = await supabase
        .from('cadernos')
        .select('id, nomecaderno')
        .order('nomecaderno', { ascending: true });

      if (cadernosError) {
        console.error('Erro ao buscar cadernos:', cadernosError.message);
        setError('Erro ao carregar cadernos.');
        setLoading(false);
        return;
      } else {
        setCadernos(cadernosData || []);
      }

      // 2. Busca os dados da notícia específica
      const { data: noticiaData, error: noticiaError } = await supabase
        .from('noticias')
        .select(`
            id,
            titulo,
            subtitulo,
            conteudo,
            capa,
            id_caderno,
            autor,
            publicidade,
            publico,
            slug
        `)
        .eq('id', noticiaId) // Filtra pela ID da notícia
        .single(); // Espera apenas um resultado

      if (noticiaError) {
        console.error('Erro ao carregar notícia:', noticiaError.message);
        setError('Notícia não encontrada ou erro ao carregar.');
      } else {
        // Preenche os estados com os dados da notícia
        if (noticiaData) {
          setTitulo(noticiaData.titulo || '');
          setSubtitulo(noticiaData.subtitulo || '');
          setConteudo(noticiaData.conteudo || '');
          setCurrentCapaUrl(noticiaData.capa || null); // Define a URL da capa atual
          setIdCaderno(noticiaData.id_caderno ? String(noticiaData.id_caderno) : ''); // Converte para string para o select
          setAutor(noticiaData.autor || '');
          setPublicidade(noticiaData.publicidade || false);
          setPublico(noticiaData.publico || false);
          // Transforma o array de slugs de volta para uma string separada por vírgulas
          setSlugInput(Array.isArray(noticiaData.slug) ? noticiaData.slug.join(', ') : '');
        } else {
          setError('Notícia não encontrada.');
        }
      }
      setLoading(false); // Finaliza o carregamento
    }

    // Só busca os dados se o noticiaId estiver disponível
    if (noticiaId) {
      fetchNoticiaAndCadernos();
    }
  }, [noticiaId]); // O useEffect é re-executado quando noticiaId muda

  // Lida com a mudança do arquivo de capa
  const handleCapaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCapaFile(file);
      setCapaPreviewUrl(URL.createObjectURL(file)); // Cria URL de preview para a nova imagem
      setCurrentCapaUrl(null); // Remove a imagem atual do preview se uma nova for selecionada
    }
  };

  // Lida com o envio do formulário de atualização
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validação básica dos campos obrigatórios
    if (!titulo || !conteudo || !idCaderno || !autor) {
      setError('Título, conteúdo, caderno e autor são obrigatórios.');
      setIsSubmitting(false);
      return;
    }

    let finalCapaUrl = currentCapaUrl; // Mantém a capa existente por padrão

    // Se uma nova capa foi selecionada, faz o upload
    if (capaFile) {
      const fileExt = capaFile.name.split('.').pop();
      // Usar um nome de arquivo único para evitar colisões (timestamp + random)
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `noticia_capas/${uniqueFileName}`;

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

      // Obtém a URL pública da capa recém-enviada
      const { data: publicUrlData } = supabase.storage
        .from('capanoticia')
        .getPublicUrl(filePath);

      finalCapaUrl = publicUrlData?.publicUrl || null;
    }

    // Converte a string de slugs para um array
    const slugsArray = slugInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Atualiza a notícia no Supabase
    const { error: updateError } = await supabase
      .from('noticias')
      .update({
        titulo,
        subtitulo,
        conteudo,
        capa: finalCapaUrl,
        id_caderno: parseInt(idCaderno), // Converte para número para o banco de dados
        autor,
        publicidade,
        publico,
        slug: slugsArray // Salva o array de strings
      })
      .eq('id', noticiaId); // Atualiza a notícia com o ID correspondente

    if (updateError) {
      console.error('Erro ao atualizar notícia:', updateError.message);
      setError('Erro ao atualizar notícia: ' + updateError.message);
    } else {
      alert('Notícia atualizada com sucesso!');
      router.push('/dashboard/noticias'); // Redireciona de volta para a lista
    }
    setIsSubmitting(false); // Finaliza o envio
  };

  // Exibe mensagem de carregamento enquanto os dados são buscados
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando notícia...</p>
      </div>
    );
  }

  // Exibe mensagem de erro se houver problemas no carregamento
  if (error && !isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Editar Notícia</h2>
      <form onSubmit={handleUpdate} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        {/* Campo de Título */}
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
        {/* Campo de Subtítulo */}
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
        {/* Campo de Conteúdo (Rich Text Editor) */}
        <div>
          <label htmlFor="conteudo" className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
          <div className="bg-white rounded-md shadow-sm">
            <ReactQuill
              theme="snow" // Tema do editor (snow é o padrão e mais comum)
              value={conteudo}
              onChange={setConteudo} // Atualiza o estado 'conteudo'
              className="h-96" // Define a altura do editor
              modules={{ // Configura a barra de ferramentas do editor
                toolbar: [
                  [{ 'header': [1, 2, false] }],
                  ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                  [{ 'indent': '-1' }, { 'indent': '+1' }],
                  ['link', 'image'],
                  ['clean']
                ],
              }}
              formats={[ // Formatos de texto permitidos
                'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
                'list', 'bullet', 'indent', 'link', 'image'
              ]}
            />
          </div>
        </div>
        {/* Campo de Capa */}
        <div>
          <label htmlFor="capa" className="block text-sm font-medium text-gray-700">Capa (Opcional)</label>
          <input
            type="file"
            id="capa"
            accept="image/*"
            onChange={handleCapaChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {(capaPreviewUrl || currentCapaUrl) && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview da Capa:</p>
              <Image
                src={capaPreviewUrl || currentCapaUrl || ''}
                alt="Preview da Capa da Notícia"
                width={100} // Ajuste o tamanho conforme necessário
                height={75} // Ajuste o tamanho conforme necessário
                objectFit="cover"
                className="rounded-md shadow-sm"
              />
            </div>
          )}
        </div>
        {/* Campo de Caderno (Dropdown) */}
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
        {/* Campo de Autor */}
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
        {/* Campo de Tags/Palavras-chave */}
        <div>
          <label htmlFor="slugInput" className="block text-sm font-medium text-gray-700">Tags / Palavras-chave (separadas por vírgula)</label>
          <input
            type="text"
            id="slugInput"
            value={slugInput}
            onChange={(e) => setSlugInput(e.target.value)}
            placeholder="Ex: esporte, futebol, flamengo"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
          <p className="mt-1 text-sm text-gray-500">Use vírgulas para separar as tags.</p>
        </div>
        {/* Checkbox "É Publicidade?" */}
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
        {/* Checkbox "Público" */}
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

        {/* Exibição de erros */}
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-3">
          <Link href="/dashboard/noticias" className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Cancelar
          </Link>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Atualizando...' : 'Atualizar Notícia'}
          </button>
        </div>
      </form>
    </div>
  );
}