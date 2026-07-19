import { defineConfig } from 'vite';

// base './' — obrigatório para o empacotamento Capacitor futuro
// (WebView carrega de file://, caminhos absolutos quebrariam)
export default defineConfig({
  base: './',
});
