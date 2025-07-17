// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redireciona a página inicial (/) para a página de login (/login)
  redirect('/login');
  // Este componente não renderiza nada visivelmente, apenas redireciona.
  return null;
}