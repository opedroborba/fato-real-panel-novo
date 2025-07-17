// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // --- Cores personalizadas para Fato Real (atualizadas) ---
        'fato-yellow': '#FFC107',       // Amarelo ouro para botões gerais
        'fato-yellow-dark': '#FFA000', // Tom mais escuro para hover
        'fato-red': '#DC3545',         // Exemplo para botões de remover/perigo
        'fato-red-dark': '#C82333',
        'fato-green': '#28A745',       // Exemplo para botões de ativar/sucesso
        'fato-green-dark': '#218838',
        'fato-rust-yellow': '#DAA520', // Amarelo Ferrugem (Goldenrod)
        'fato-rust-yellow-dark': '#B8860B', // Tom mais escuro para hover
        'fato-black': '#151515',       // Preto para texto
        // --- Cores para o menu lateral (manter ou ajustar se necessário) ---
        'sidebar-bg': '#212529',       // Um cinza bem escuro, quase preto para o menu
        'sidebar-hover': '#343A40',    // Hover para o menu
        'sidebar-text': '#F8F9FA',     // Texto claro para o menu
        // --- Fim das cores personalizadas ---
        backgroundImage: {
          'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
          'gradient-conic':
            'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        },
      },
    },
  },
  plugins: [],
};