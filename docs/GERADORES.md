# Geradores de folhas — `src/geradores/` (2026-11-16)

Branch `fable/ler-o-mundo-e-caa`. **Não publicado e ainda sem tela**: são
motores puros, com teste, à espera de formulário. Feito por Claude (Fable 5.2).

A ideia do Bruno: o app como uma caixa de brincadeiras e folhas para imprimir,
com muita variedade, tudo gerado na hora a partir de dados simples.

## A receita (seguir em todo gerador novo)

1. Função pura: dados simples entram, SVG A4 sai (viewBox 800 × 1131 com
   `data-folha-a4="true"`, que o `motorImpressao.ts` já imprime).
2. **Sem sorte.** A mesma entrada dá sempre a mesma folha. Onde é preciso
   embaralhar (caça-palavras), o embaralho nasce de uma semente tirada da
   própria lista; `semente: 1, 2, 3…` dá outras folhas com as mesmas palavras.
3. Modelo separado do desenho (`gerarX()` devolve dados; `svgXA4()` desenha),
   para a mesma brincadeira poder existir na tela um dia.
4. O que não coube volta em `fora`, com o motivo, em vez de sumir.
5. Texto sempre por `escrever()` de `comum.ts` (letra em caminhos, nunca lança,
   encolhe para caber). Símbolo que a letra não tem (√, ↓, emoji) é descartado
   em silêncio: escrever por extenso ("raiz de").
6. Medida real por `mm()`: a folha de 800 unidades sai com 190 mm de largura.

## O que existe

| Arquivo | O que faz |
|---|---|
| `comum.ts` | `mm`, semente e sorteador, `escrever`, `negrito`, `comHalo`, `folha` (com cabeçalho) e `folhaNua` |
| `cacaPalavras.ts` | `gerarCacaPalavras({ palavras, nivel, lado, semente })` + `svgCacaPalavrasA4(jogo, { titulo, gabarito })`. Níveis: fácil (→ ↓), médio (+ ↘), difícil (8 direções). Garante cada palavra uma vez só e nenhuma palavra feia formada por acaso |
| `cruzadinha.ts` | `gerarCruzadinha([{ palavra, dica }])` + `svgCruzadinhaA4`. Numeração de jornal; grade de até 15 casas |
| `papeis.ts` | `svgPautaA4` (`PAUTAS.comum / larga / ampliada / muitoAmpliada`), `svgCaligrafiaA4`, `svgQuadriculadoA4`, `svgMilimetradoA4`, `svgPontilhadoA4`, `svgReguasA4`, `svgPlanoCartesianoA4` (com `curva` e `respostas`), `bhaskara`, `passosBhaskara`, `svgCalendarioA4` (modelos `figura` e `anotar`), `svgCalendarioAnoA4`, `feriadosNacionais`, `pascoa` |
| `geradores.test.ts` | 17 testes |
| `../conteudo/silabas.ts` | separador de sílabas (sugestão que a professora confere) |
| `scripts/exportar-geradores.mjs` | `node scripts/exportar-geradores.mjs <pasta>`: 20 SVGs de amostra + `amostra.html` |

## Conferido

- `npm test`: 194 testes; `npm run build` limpo.
- De olho, em imagem (Chromium sem janela): as 20 folhas de amostra.

**NÃO conferido:** impressão em papel (nenhuma folha foi impressa nem medida
com régua); o caminho pelo `motorImpressao.ts` (só o SVG avulso foi visto);
iPhone, onde o fator 0,86 **quebra as medidas reais** da régua, do
quadriculado e do milimetrado; uso por aluno ou professora.

## Decisões e ressalvas

- **Pauta ampliada**: 14 mm entre linhas e traço de 0,8 mm (20 mm e 1,1 mm na
  "muito ampliada"). São números meus, a partir do que o Bruno descreveu
  (cadernos de pauta ampliada para baixa visão); ele não achou o documento da
  antiga ideia "Linha Clara". **Ajustar com um caderno de verdade na mão.**
- **Calendário**: semana começa no domingo. Feriados só os **nacionais** de
  data fixa mais a Sexta-feira Santa; Carnaval e Corpus Christi (pontos
  facultativos), estaduais e municipais ficam de fora. Domingo em letra forte,
  feriado com aro: nada depende de cor.
- **Figura do calendário**: só aceita imagem embutida (`data:` PNG/JPEG/WebP);
  sem imagem fica a moldura tracejada para desenhar ou colar.
- **Caça-palavras**: a grade não tem acento (ATENÇÃO vira ATENCAO); a lista
  embaixo fica como foi escrita. Palavra dentro de outra (PARA em PARADA) sai,
  porque teria dois lugares certos.
- Folhas sem marca de criança (`IDENTIDADE_NEUTRA`): servem do 1º ano ao
  ensino médio. Passar `identidade` para pôr a marca do Historinhas.

## O que falta

1. **Tela "Fazer uma folha"** (área de quem ensina): escolher o gerador,
   digitar a lista, ver a prévia, imprimir pelo `motorImpressao`. É onde tudo
   isto passa a existir para a professora. Trabalho de tela: modelo menor.
2. Caça-palavras a partir das palavras de um livro da estante e dos grupos do
   Ler o Mundo (um botão em cada um).
3. Cruzadinha com **desenho no lugar da dica** (os 60 pictogramas de
   `src/caa/pictogramas.ts`).
4. Jogos de mesa: memória, dominó, bingo com cartelas todas diferentes.
5. Mais matemática: reta numérica, relógio, função do 1º grau, folha de
   exercícios de Bhaskara com gabarito (a conta já existe em `passosBhaskara`).
6. Frase → tira de pictogramas; diário de uso da prancha.
