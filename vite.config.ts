import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// base './' — obrigatório para o empacotamento Capacitor futuro e para o
// GitHub Pages (servido em /app-infantil/)
export default defineConfig({
  base: './',
  plugins: [
    // PWA: instalável na tela do tablet e 100% offline após a primeira
    // visita (precache de tudo, incluindo fontes — princípio zero-rede).
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
      manifest: {
        name: 'Historinhas',
        short_name: 'Historinhas',
        description: 'Ler, pintar e pensar — histórias, alfabetos e filosofia para crianças',
        lang: 'pt-BR',
        display: 'standalone',
        orientation: 'any',
        background_color: '#fff6ec',
        theme_color: '#fff6ec',
        icons: [
          { src: 'icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icone-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
});
