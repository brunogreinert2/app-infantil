/**
 * O BOTÃO DE LIGAR da tela "Fazer uma folha" (telaFolhas.ts).
 *
 * Enquanto for `false`:
 *  - em desenvolvimento (`npm run dev`) a tela abre pelo endereço `#folhas`;
 *  - no app publicado ela não abre por endereço nenhum, não aparece em menu
 *    nenhum e o código dela nem é baixado.
 *
 * Para ligar: trocar para `true`. O botão "Fazer uma folha" aparece em
 * Ajustes → Para quem ensina (atrás da trava dos adultos) e `#folhas` passa a
 * abrir a trava e, depois dela, a tela.
 *
 * Fica num arquivo só seu para o main.ts ler a chave sem carregar os geradores.
 */
//
// LIGADO em 2026-11-19 (Bruno: «já gostaria que ela tivesse acesso total das
// funcionalidades» — a Luiza olha o app na semana seguinte). Com ele ligado
// aparecem também, na barra lateral da criança, 🎮 Jogos e 🖨️ Para quem
// ensina (este pede a trava dos adultos).
export const FOLHAS_LIGADAS: boolean = true;
