// src/app/layout.tsx (Este é o root layout principal da sua aplicação Next.js)

import './globals.css'; // Importa seu CSS global, incluindo o Tailwind CSS

// Você pode definir metadados aqui, se quiser, como título padrão, descrição, etc.
export const metadata = {
  title: 'Fato Real - Painel Administrativo',
  description: 'Sistema de Gerenciamento de Notícias Fato Real',
};

// O layout raiz deve envolver o children (todo o seu aplicativo) com <html> e <body>
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children} {/* Aqui é onde TODO o conteúdo da sua aplicação (incluindo o dashboard) será renderizado */}
      </body>
    </html>
  );
}