// src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'; // Ou createClient para versões mais antigas do @supabase/supabase-js

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- Adicione esta função se ainda não tiver ---
export async function fetchAllCadernos() {
  const { data, error } = await supabase
    .from('cadernos')
    .select('id, nomecaderno') // Seleciona apenas o ID e o nome para o dropdown
    .order('nomecaderno', { ascending: true }); // Opcional: ordenar por nome

  if (error) {
    console.error('Erro ao buscar todos os cadernos:', error.message);
    return [];
  }
  return data || [];
}