# Plano Capacitor — do PWA ao app de loja

Decisão do Bruno (2026-07-24): o **pedraangular.app.br permanece PWA leve**;
o **app infantil vira app robusto de loja**, mesmo que pese centenas de MB
(ou GB, com narrações e vídeos). O PWA atual é o ESTÁGIO INTERMEDIÁRIO — já
serve para usar, testar com a família e apresentar (UFRGS); nada dele se perde.

## O que é o Capacitor, em uma frase

Uma "moldura nativa" (Android/iOS) que carrega EXATAMENTE este app web por
dentro — 100% do código atual continua — e dá a ele superpoderes de app de
verdade: ícone de loja, banco de dados real, arquivos no disco, TTS nativo.

## O que muda e o que fica

| | PWA (hoje) | Capacitor (alvo) |
|---|---|---|
| Instalação | "Adicionar à tela inicial" | Play Store / App Store |
| Peso máximo prático | ~50 MB (cache de navegador) | GBs (arquivos no disco) |
| Dados | localStorage (navegador pode limpar em aparelho cheio) | SQLite + Preferences (spec 8.4, sobrevivem a tudo) |
| TTS | Web Speech (bugs do Chrome) | Motor nativo do aparelho, estável offline |
| Áudio/vídeo pesado | entra no bundle (ruim > ~50 MB) | baixado 1x para o disco via Filesystem, offline pra sempre |
| Atualização | botão 🔄 / recarregar | pela loja (ou live update) |

## Passos, na ordem (cada um é uma sessão tranquila)

1. **Exportar/importar dados** (item 9 da fila) ANTES de tudo — ninguém
   perde pintura na migração.
2. `npm i @capacitor/core @capacitor/cli && npx cap init historinhas
   br.<dominio>.historinhas --web-dir dist && npx cap add android`.
3. Trocar implementação de `armazenamento.ts`: chaves triviais →
   `@capacitor/preferences`; dados → `@capacitor-community/sqlite`
   (schema pronto na ESPECIFICACAO.md 8.4; chaves atuais mapeiam 1:1).
   Migração: na 1ª abertura nativa, importar o backup exportado do PWA.
4. `src/tts.ts` → `@capacitor-community/text-to-speech` (mesmas assinaturas).
5. Mídia pesada (narrações, vídeos): NÃO empacotar no bundle web — servir
   do GitHub Pages e cachear no disco via `@capacitor/filesystem` no
   primeiro uso (spec seção 1). O catálogo aponta URL + hash.
6. `@capacitor/app` (estado sobrevive a background), `@capacitor/splash-screen`,
   `@capacitor/status-bar` — polimento "app de verdade".
7. Testar em Android de entrada (checklist spec §6).
8. Publicar: conta Google Play (US$ 25, uma vez). iOS/App Store
   (US$ 99/ano + precisa de um Mac para compilar) fica para depois.

## Pré-requisitos na máquina do Bruno

Android Studio + SDK (download grande, ~qualquer PC aguenta) e um cabo USB
para testar no aparelho real. O Claude guia a instalação quando chegar a hora.

## Importante

- O canal web (GitHub Pages/PWA) CONTINUA existindo em paralelo — é o link
  que a família e os professores abrem sem instalar nada.
- Nenhuma linha das telas/motor muda por causa do Capacitor: as fronteiras
  certas (armazenamento.ts, tts.ts, catalogo) foram desenhadas desde o
  primeiro dia exatamente para isso.
