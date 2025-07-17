// src/app/api/upload-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // --- Início da Depuração de Autenticação ---
    // ATENÇÃO: Para testes, você pode comentar o bloco 'if (userError || !user)' abaixo.
    // Lembre-se de REATIVAR em produção para segurança!
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    console.log('--- Debug de Autenticação na API Route ---');
    console.log('User object:', user);
    console.log('User Error:', userError?.message);
    console.log('------------------------------------------');

    // Mantenha este bloco COMENTADO APENAS PARA DEPURAR.
    // Descomente para produção!
   // if (userError || !user) {
    //   console.error('Usuário NÃO AUTORIZADO para upload na API:', userError?.message || 'Usuário nulo.');
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    //}
    // --- Fim da Depuração de Autenticação ---


    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    // Garante que o nome do arquivo seja seguro e único
    const originalFileName = file.name;
    const fileExtension = originalFileName.split('.').pop();
    const baseFileName = originalFileName.substring(0, originalFileName.lastIndexOf('.')) || originalFileName;
    const sanitizedBaseFileName = baseFileName.replace(/[^a-zA-Z0-9-_.]/g, '_'); // Remove caracteres inválidos, mantém apenas letras, números, hífens, underscores e pontos
    const uniqueFileName = `${Date.now()}-${sanitizedBaseFileName}.${fileExtension}`;

    // Define o caminho completo dentro do bucket.
    // Certifique-se de que 'noticia_conteudo' é uma pasta válida no seu bucket 'capanoticia'.
    const filePath = `capanoticia/${uniqueFileName}`;
    const { data, error } = await supabase.storage
      .from('capanoticia') // Seu bucket de armazenamento
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false, // Não sobrescreve se já existir (evita conflitos de nome)
      });

    if (error) {
      console.error('Erro ao fazer upload no Supabase Storage:', error.message);
      // Inclui mais detalhes no erro para o cliente, se for um problema do Supabase
      return NextResponse.json({ error: 'Erro no upload para o Storage: ' + error.message }, { status: 500 });
    }

    // Obtém a URL pública da imagem recém-carregada
    const { data: publicUrlData } = supabase.storage
      .from('capanoticia')
      .getPublicUrl(filePath);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      console.error('Erro ao obter URL pública após upload.');
      return NextResponse.json({ error: 'Erro ao obter URL pública da imagem.' }, { status: 500 });
    }

    return NextResponse.json({ location: publicUrlData.publicUrl }, { status: 200 });

  } catch (parseError: any) {
    console.error('Erro ao processar requisição de upload:', parseError.message);
    return NextResponse.json({ error: 'Erro interno do servidor: ' + parseError.message }, { status: 500 });
  }
}