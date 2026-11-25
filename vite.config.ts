import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import pacote from './package.json' with { type: 'json' };

// base './' — obrigatório para o empacotamento Capacitor futuro e para o
// GitHub Pages (servido em /app-infantil/)
export default defineConfig({
  base: './',
  // A versão vem do package.json e a data é a da montagem: o "Sobre" dos
  // Ajustes mostra as duas. Antes o número estava escrito à mão no texto e
  // ficou em 0.2.0 por umas dez publicações. Agora: subiu a versão no
  // package.json, ela aparece sozinha.
  define: {
    __VERSAO__: JSON.stringify(pacote.version),
    __MONTADO_EM__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  plugins: [
    // PWA: instalável na tela do tablet e 100% offline após a primeira
    // visita (precache de tudo, incluindo fontes — princípio zero-rede).
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        // a voz da calculadora (Vosk ~6 MB + modelo ~31 MB) só vem para quem
        // tocar em «Ligar a voz», e o próprio Vosk a guarda no aparelho
        globIgnores: ['**/vosk-*.js', 'voz/**', '__teste-voz/**'],
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
