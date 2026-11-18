# Geradores de folhas — `src/geradores/` (2026-11-16)

Branch `fable/ler-o-mundo-e-caa`. **Não publicado.** Motores puros com teste e
uma tela pronta, mas desligada (ver abaixo). Feito por Claude (Fable 5.2).

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
| `jogosDeMesa.ts` | `lerPecas` (palavra vira peça; ganha desenho se a prancha tiver), `svgMemoriaA4` (pares iguais ou de leitura, com folha de verso), `gerarDomino`/`svgDominoA4` (7 palavras = 28 pedras), `gerarBingo`/`svgBingoA4` (cartelas todas diferentes + fichas de chamar), `svgTabuleiroA4`, `svgPecasDamasA4`, `svgPecasXadrezA4` |
| `matematica.ts` | `lerHoras`, `svgRelogiosA4` (ler a hora ou marcar os ponteiros, com respostas), `svgRelogioDeMontarA4` (relógio grande com ponteiros de recortar), `svgRetasA4` (reta numérica, com retas para completar) |
| `pedido.ts`, `telaFolhas.ts`, `ligado.ts` | a tela (ver abaixo) |
| `silabario.ts` | `svgFamiliasA4` (BA BE BI BO BU, inteiras ou para completar), `svgSilabasMoveisA4` (monte a palavra: desenho + caixas + sílabas para recortar), `pecasDeSilabas` (peças de bingo e dominó de sílabas, sem desenho) |
| `logica.ts` | `gerarLabirinto` (labirinto perfeito por semente, 3 tamanhos, com caminho de resposta), `gerarSudoku` (4 × 4, 6 × 6 e de figuras, sempre com uma solução só) |
| `contas.ts` | `gerarContas` (as quatro operações, com ou sem "vai um"/"empresta", divisão exata à brasileira), `svgTabuadaA4`, `svgTabuaA4` (tábua de Pitágoras) |
| `recortar.ts` | material dourado, frações em barras (1 a 1/12) e em círculos, quadro de valor posicional, tangram — em mm de verdade |
| `cartoes.ts` | treino de tesoura, "siga o caminho" (traçado entre dois desenhos), HQ em branco (3, 4 ou 6 quadros), crachás, marcadores de página, etiquetas de caderno |
| `geradores.test.ts` | 37 testes |
| `../conteudo/silabas.ts` | separador de sílabas (sugestão que a professora confere) |
| `scripts/exportar-geradores.mjs` | `node scripts/exportar-geradores.mjs <pasta>`: 20 SVGs de amostra + `amostra.html` |

## Conferido

- `npm test`: 216 testes; `npm run build` limpo.
- De olho, em imagem (Chromium sem janela): as 34 folhas de amostra
  (`scripts/exportar-geradores.mjs`) e as 23 do primeiro lote das sugestões
  (`scripts/exportar-lote.mjs`).
- **Em papel, pelo Bruno (2026-11-18):** imprimiu muitas folhas; "a régua
  ficou perfeita, na casa dos milímetros".

**NÃO conferido:** uso por aluno ou professora (nenhuma passou pela mão de uma
professora ainda); iPhone, onde o fator 0,86 **quebra as medidas reais** da
régua, do quadriculado, do milimetrado e da matemática de recortar; as folhas
do primeiro lote (silabário em diante) ainda não foram impressas.

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
- **Jogos de mesa**: as peças usam os 60 desenhos da prancha (provisórios; ver
  `CAA.md`). Palavra sem desenho vai só escrita, e a tela avisa quais. Na
  memória de leitura o par é figura + palavra. O sorteio do bingo é de papel
  (fichas num saquinho); o app não sorteia nada.
- **Xadrez**: as peças são rodelas com a letra (R, D, T, B, C, P, a notação
  brasileira), não figuras de rei e cavalo. É o que dá para recortar e ler; se
  o Bruno quiser silhuetas, é arte a desenhar. Casas de 22 mm, peças de 19 mm.
  As casas escuras são cinza (pouca tinta, e a peça preta aparece em cima).
- Folhas sem marca de criança (`IDENTIDADE_NEUTRA`): servem do 1º ano ao
  ensino médio. Passar `identidade` para pôr a marca do Historinhas.

## A tela "Fazer uma folha" — pronta e DESLIGADA

`src/geradores/telaFolhas.ts` (a tela), `pedido.ts` (do formulário à folha,
parte pura e testada) e `ligado.ts` (a chave).

- **Para usar hoje, no computador:** `npm run dev` e abrir
  `http://localhost:5173/#folhas`. Escolher o tipo, preencher, ver a prévia e
  "🖨️ Imprimir ou guardar em PDF" (na janela de impressão, "Salvar como PDF";
  escala 100% para as medidas valerem). Funciona sem internet.
- **No app publicado, enquanto `FOLHAS_LIGADAS` for `false`:** `#folhas` não
  abre nada, não há botão em menu nenhum e o código da tela nem entra no
  pacote (conferido no `dist/`: nenhum arquivo dela).
- **Para ligar:** trocar para `true` em `src/geradores/ligado.ts` (e ajustar o
  teste "a tela nasce desligada"). Aparece o botão "🖨️ Fazer uma folha" em
  Ajustes → Para quem ensina, atrás da trava; `#folhas` passa a pedir a trava.
- O que se preenche fica guardado no aparelho (`folhas:pedidos`), menos a
  figura do calendário, que é grande.
- No caça-palavras há "Ver estas palavras em sílabas" (sugestão do separador).

Conferido no navegador do app (1280 px e 375 px): os sete tipos dão prévia,
avisos aparecem (palavra que ficou de fora), a impressão monta as folhas A4,
sem rolagem lateral no celular, sem erro no console. **NÃO conferido:** o PDF
de verdade saindo da janela de impressão, papel, iPhone, leitor de tela, e a
figura do calendário com foto real.

## O que falta

1. **Ligar a tela** quando o Bruno decidir (acima) e decidir onde ela mora
   para um adolescente (decisão 3 de `LER_O_MUNDO.md`).
2. Caça-palavras a partir das palavras de um livro da estante e dos grupos do
   Ler o Mundo (um botão em cada um).
3. Cruzadinha com **desenho no lugar da dica** (os 60 pictogramas de
   `src/caa/pictogramas.ts`).
4. Mais jogos de mesa: trilha (tabuleiro de percurso), jogo da velha, ludo,
   quebra-cabeça de recortar, dominó de figura com palavra.
5. Mais matemática: função do 1º grau, folha de exercícios de Bhaskara com
   gabarito (a conta já existe em `passosBhaskara`), troco com
   dinheiro de brincadeira, "quanto falta para o ônibus das 7:15" (o relógio
   já existe em `matematica.ts`).
6. Frase → tira de pictogramas; diário de uso da prancha.
7. **Sugestões das outras IAs ainda não feitas** (lista avaliada em 2026-11-18):
   - médias: ligue os pontos (pontos tirados do contorno dos desenhos),
     simetria no quadriculado, pintura por código (conta ou sílaba), letras
     vazadas para cobrir, rotina visual "primeiro → depois";
   - a maior: **sequência didática a partir de um livro da estante** (texto,
     perguntas do quiz, caça-palavras do vocabulário, desenho para colorir,
     gabarito) — uma sessão inteira só para ela;
   - silhuetas do tangram (figuras para montar);
   - **não fazer**: "melhor leitor", semáforo e quadro de comportamento
     (ranking e pressão contrariam os princípios 4 e 7 do CLAUDE.md); diploma
     só de participação ("Terminei o livro X"). Mapas mudos e máscaras ficam
     para depois (dados geográficos pesados; arte à mão).
