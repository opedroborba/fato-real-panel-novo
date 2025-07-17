// src/app/dashboard/page.tsx
// Certifique-se de que este arquivo é 'use client' se tiver interatividade ou use hooks do React
// Se for uma página puramente estática, pode não precisar do 'use client'
'use client'; 

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DashboardHomePage() {
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/login'); // Redireciona para login se não estiver autenticado
      }
    }
    checkUser();
  }, [router]);


  // Conteúdo da página inicial do dashboard
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Bem-vindo ao Dashboard!</h1>
      <p>Selecione uma opção no menu lateral para começar.</p>
      {/* Você pode adicionar mais conteúdo aqui para a página inicial do dashboard */}
    </div>
  );
}