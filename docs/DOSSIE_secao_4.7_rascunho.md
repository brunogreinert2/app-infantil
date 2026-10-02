### 4.7 O outro custo de entrada: peso, rede e aparelho velho

Esta seção trata de uma exclusão que não é sensorial nem cognitiva, e que
mesmo assim decide quem consegue abrir o programa.

**O problema.** Acessibilidade, em material didático digital, quase sempre é
lida como deficiência — e para aí. Mas há criança que não usa um app
educativo por outro motivo: o tablet é de 2015 e está com a memória cheia, o
plano de dados é contado, a escola tem wi-fi que cai, a casa não tem conta em
loja de aplicativos, o cartão de crédito não existe. O app de mercado
equivalente pesa dezenas ou centenas de megabytes, exige instalação por loja,
exige cadastro, e muitos exigem estar online para funcionar. Nenhuma dessas
exigências aparece numa lista de acessibilidade, e todas elas excluem.

**A decisão.** O programa roda no navegador, num endereço aberto, sem conta e
sem loja. Depois do primeiro acesso ele se instala no aparelho e funciona sem
rede. O texto dos livros é escrito em `.md` e **empacotado dentro do próprio
programa** na construção, não buscado na internet durante o uso; a arte é
vetorial (SVG), que escala sem pesar e ainda serve de contorno para
impressão — uma arte, três papéis. Não há chamada de rede depois de aberto.

**A evidência.** Medido em 2026-08-21 na pasta publicada (`dist`), somando os
arquivos que o navegador realmente baixa:

```
app publicado, tudo somado ......... 1,0 MB
  fontes ...........................  757 KB   (75%)
  programa (JavaScript + CSS) ......  204 KB   (20%)
  ícones, manifesto, resto .........   43 KB    (5%)
```

O número que interessa está na comparação entre as duas primeiras linhas: **as
fontes de acessibilidade pesam 3,7 vezes mais que o programa inteiro.** São a
OpenDyslexic com o suplemento que cobre grego, a Cardo, a Atkinson Hyperlegible
(desenhada pelo Braille Institute para baixa visão) e a DejaVu. Se o objetivo
fosse um app leve, elas seriam a primeira coisa a cortar. Elas ficam, e o app
continua cabendo em um megabyte.

Para dar escala: 1,0 MB é menos que uma única foto tirada por um celular
comum. É o app completo — oito livros, quiz, páginas de pintar,
quebra-cabeça, o alfabeto grego, quatro temas e quatro famílias tipográficas.

A instalação e o funcionamento sem rede não são promessa: o programa publica um
`manifest.webmanifest` com `display: standalone` e um *service worker* gerado
por Workbox, que guarda os arquivos no aparelho no primeiro acesso. A partir
daí o app abre com ícone próprio, em tela cheia, com o avião ligado.

**Por que interessa à disciplina.** Acessibilidade e exclusão digital são coisas
diferentes, e as duas decidem quem fica de fora. Um material didático que só
funciona com internet boa e aparelho novo já escolheu seu público antes da
primeira tela — e escolheu contra exatamente a criança que mais precisaria
dele. Peso de arquivo, aqui, não é virtude de engenharia: é uma decisão sobre
quem entra.

Vale notar que essa decisão nasceu antes de ter nome. O `.md` foi escolhido
porque é simples de escrever e de versionar; o SVG, porque a mesma arte servia
para pintar na tela e para imprimir; o funcionamento offline, porque o aparelho
das crianças ficava longe do roteador. Só depois ficou claro que as três
escolhas respondiam à mesma pergunta.

**O que não está resolvido.**

- As medições de peso são do arquivo publicado. **Não há medição de tempo de
  carga em rede lenta** — nem em 3G, nem em wi-fi de escola congestionado.
- **Não houve teste em aparelho antigo de verdade.** Os testes foram nos
  aparelhos da casa, que são modestos, mas não são o tablet de 2015 que o
  argumento acima invoca.
- **O primeiro acesso ainda exige internet.** Numa escola sem rede, alguém
  precisa chegar com o app já instalado. Não há, hoje, uma forma de instalar
  a partir de um arquivo ou de um cartão de memória.
