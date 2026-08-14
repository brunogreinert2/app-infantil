# Dossiê — um app de leitura pensado para quem não enxerga direito

Material de apoio para apresentação em EDU01013 — Intervenção Pedagógica e
Necessidades Educativas Especiais.

Este documento existe para dar nome ao que já estava feito. Nenhuma decisão
listada aqui foi tomada para a disciplina: todas foram tomadas antes, por
motivos práticos, e a disciplina só ofereceu o vocabulário.

Reunido em 2026-08-14, revisado em 2026-08-16. Todos os números foram medidos
nos arquivos e no app rodando, não estimados. Onde algo não está resolvido,
está dito — e onde já esteve errado e foi corrigido, o erro fica contado.

---

## 1. O que é

Dois programas irmãos, feitos para funcionar sem internet depois de abertos:

**Historinhas** — livros ilustrados para criança, com quiz, páginas de pintar,
quebra-cabeça e um livro do alfabeto grego. Público inicial: dois leitores de
7 e 9 anos.

**Pedra Angular** — leitor de textos clássicos em grego, hebraico, latim,
português e inglês. Público: quem lê filosofia e escrituras, incluindo um
leitor idoso com baixa visão.

Compartilham o motor, as fontes, os temas e o piso de acessibilidade. O que
muda é o conteúdo e o tom.

---

## 2. Para quem, de verdade

Isto não é um trabalho de disciplina que ganhou usuários depois. É o inverso.

| Pessoa | O que exigiu |
| --- | --- |
| Um menino de 7 anos | que largasse o app se ficasse chato — nada de trava, nada de nota |
| Um menino de 9 anos | pediu o alfabeto grego: "coisa para pintar e aprender grego" |
| Um leitor idoso com baixa visão | letra em corpo 60, contraste alto, alvo de toque grande |
| O autor, com protanomalia | nada pode ser dito só pela cor |

O último é importante para a disciplina: **quem projetou tem uma alteração de
visão de cores.** Várias decisões deste app nasceram de o autor não conseguir
distinguir algo na própria tela.

---

## 3. As decisões, com a evidência

Cada bloco segue a mesma forma: o problema, a decisão, e como se sabe que
funciona.

### 3.1 Contraste: nove esquemas, todos medidos

**O problema.** Não existe um esquema de cor bom para todo mundo. Cada
condição ocular prefere um par texto/fundo diferente — catarata, glaucoma,
degeneração macular, fotofobia. Oferecer "modo escuro" e achar que resolveu é
não ter olhado.

**A decisão.** Nove esquemas no leitor, quatro no infantil, todos com
contraste de no mínimo **7:1** entre texto e fundo. O 7:1 é o nível AAA da
norma internacional (WCAG), e não o 4,5:1 que a maioria dos sites usa.

**A evidência.** Um programa (`scripts/medir_contraste.py`) lê as cores
**direto do arquivo publicado** e calcula. Medido em 2026-08-08, na ordem em
que aparecem na tela:

```
21,00 · 21,00 · 16,57 · 15,49 · 12,68 · 14,03 · 15,38 · 13,49 · 9,17
```

Nove temas, nenhuma reprovação. O número cai devagar porque os esquemas de
conforto e os decorativos também respeitam o piso — a diferença entre eles é
de propósito, não de aprovação.

**Detalhe que vale mencionar:** o programa lê as cores do arquivo que está no
ar, não de uma cópia digitada. Medir uma cópia é medir outra coisa.

### 3.2 Daltonismo: simulação, não suposição

**O problema.** Duas cores podem ter contraste ótimo contra o fundo e mesmo
assim serem indistinguíveis **entre si** para quem tem daltonismo.

**A decisão.** O mesmo programa simula as três dicromacias — protanopia,
deuteranopia e tritanopia — pelo método de Viénot, Brettel e Mollon (1999), e
mede a distância entre as cores da busca.

**A evidência, e o erro que ela pegou.** A busca do leitor destaca todas as
ocorrências em amarelo e a ocorrência atual noutra cor. No tema verde sobre
preto, a ocorrência atual era amarela: sob tritanopia, o amarelo chega quase
branco e os dois destaques **colapsavam num só**. Quem procurava uma palavra
perdia de vista qual estava selecionada.

Trocado por laranja, que se separa nas três simulações. Está escrito no código
por quê.

### 3.3 Nunca dizer nada só pela cor

**O problema.** Verde para certo e vermelho para errado é a convenção mais
comum do mundo, e é invisível para cerca de 8% dos meninos.

**A decisão.** Toda informação de estado carrega **cor mais forma ou palavra**.

**Onde aparece:**

- o quiz revela a resposta com ✓ e ✗, não só com fundo colorido
- cada pote de tinta tem nome falável, para leitor de tela
- os avisos técnicos começam com a palavra "Atenção" ou "Tudo certo"
- a opção escolhida ganha borda mais grossa e uma marca ✓, não só cor

### 3.4 Tipografia: a fonte escolhida por um óptico

**A decisão.** Três fontes à escolha, e a padrão do app infantil é a
**OpenDyslexic** — desenhada para dislexia, com a base das letras mais pesada
para reduzir a troca entre b/d e p/q.

A escolha da padrão foi feita por um profissional da óptica olhando a tela, e
não por preferência estética. Continua trocável a qualquer momento: **padrão
não é imposição.**

**A honestidade que a disciplina merece:** a evidência científica de ganho
objetivo de velocidade de leitura com fontes para dislexia é **mista**. O que
é bem relatado é a preferência subjetiva. Por isso ela é oferecida como opção,
nunca como solução — e isso está escrito na especificação do projeto desde o
começo.

### 3.5 O grego que sumia — um erro achado medindo

Este é o achado mais útil para a disciplina, porque mostra o método.

**O problema, que ninguém tinha visto.** O livro do alfabeto grego escreve
cada página como `Α α — Alfa`, com as letras gregas em texto. O pacote de
OpenDyslexic que o app usava tinha **233 caracteres e nenhuma letra grega**.

Resultado: nas 24 páginas do alfabeto, as letras gregas apareciam numa fonte
qualquer do aparelho, diferente de todo o resto da página. **Justamente as
letras que o livro existe para ensinar** eram as únicas fora do desenho — e
quem lê é o menino de 9 anos que pediu o livro.

**Como se descobriu.** Lendo a tabela de caracteres do arquivo da fonte, não
confiando na documentação.

**A decisão.** Duas versões da mesma fonte convivem: a que o app usa para
tudo, e outra, com 1927 caracteres, restrita às faixas que a primeira não tem.
O navegador escolhe **por caractere**. Medido depois: a largura do texto em
português ficou idêntica (85,4 px antes e depois) — nada mudou de aparência,
só o grego deixou de cair fora.

**A lição, que vale para qualquer material didático digital:** um caractere
que a fonte não tem não some. Ele aparece com outro desenho, e quem está
aprendendo aquele símbolo é justamente quem menos pode receber duas versões
dele.

### 3.6 A voz que lia grego com sotaque português — e o silêncio que ninguém ouvia

Segundo erro achado medindo, e o mais instrutivo dos dois.

**O sintoma.** No leitor, a leitura em voz alta do Evangelho de João "pulava e
só lia 1, 2, 3" — apenas os números dos versículos. O texto grego não saía.

**A causa.** O programa escolhia **uma voz para o documento inteiro**, e essa
voz era de português. Texto grego mandado a uma voz portuguesa não produz som
nenhum: o motor falha em silêncio, o programa entende que terminou e passa
adiante. Sobravam os algarismos, que a voz portuguesa consegue falar.

O detalhe cruel: **nada indicava erro.** Não havia mensagem, não havia travamento.
Só um leitor ouvindo números soltos e não sabendo por quê.

**A decisão.** A voz passa a ser escolhida **por trecho**, a partir da escrita
detectada — grego, hebraico, cirílico ou português. E cada trecho em língua
estrangeira ganha a etiqueta `lang` no próprio texto, que é o que permite a um
**leitor de tela** (não só a esta leitura em voz alta) pronunciar corretamente.

**A evidência.** Verificado no Evangelho de João: 310 trechos marcados como
grego antigo, e a voz selecionada para cada parágrafo passa a ser a voz grega
instalada no aparelho.

**E quando não há voz?** O app **avisa e pula**, em vez de ler com a fonética
errada fingindo que leu. Um aparelho sem voz grega não deve improvisar um
grego com sotaque português: é pior que o silêncio, porque parece certo.

**Por que interessa à disciplina.** A mesma lógica de detecção já existia em
outra parte do projeto — e funcionava lá. O erro não foi de conhecimento, foi
de **não ter levado o que já se sabia para todos os lugares**. Em material
didático digital, é o tipo de falha mais comum: a acessibilidade existe numa
tela e some na seguinte.

**Marcar `lang` também é o que faz a fonte certa aparecer.** Descobriu-se, no
mesmo trabalho, que a cópia estática dos livros marcava o idioma corretamente
mas não tinha **fonte com grego embutida** — então as letras gregas eram
desenhadas por qualquer fonte que o aparelho tivesse, diferente em cada um.
Corrigido na mesma passagem.

### 3.7 Tamanho da letra: o leitor decide, até onde a tela aguenta

**A decisão.** O corpo da letra é ajustável pelo próprio leitor, com dois
botões sempre visíveis — nunca escondidos em menu, porque quem precisa deles
precisa **antes** de conseguir ler o menu.

**Os números.** No infantil, de 12 a 180 px: **15 vezes** entre o menor e o
maior. No leitor, até 256 px. O aumento é proporcional, não linear — somar
sempre 2 px dá degraus que perdem sentido conforme a letra cresce.

No leitor há ainda pinça de dois dedos sobre o texto, e o texto **reflui**:
não vira rolagem lateral.

**Honestidade sobre o teto:** o infantil para em 180 px porque foi verificado
que a estante sai limpa até ali e vaza depois. Igualar aos 256 do leitor exige
antes resolver o avatar do perfil, que a 256 px fica com 3,5 cm de altura.

### 3.8 Alvo de toque: 44 pixels, e por quê

**A decisão.** Todo botão tem no mínimo 44 × 44 px, e os que mais importam
são maiores — fechar uma nota, escolher tema, expandir capítulo.

**O detalhe que quase ninguém faz:** o alvo é ampliado por **espaçamento
interno**, nunca por aumento da letra. Se o alvo crescesse aumentando a fonte,
o texto dançaria a cada ajuste. O toque fica maior e a linha fica parada.

### 3.9 Movimento: quem pediu para reduzir, tem reduzido

**O problema.** Animação contínua atrapalha quem tem desordem vestibular,
enxaqueca com aura ou dificuldade de atenção. Sistemas operacionais têm uma
preferência para isso — e quase nenhum site a respeita.

**A decisão.** Os dois apps respeitam `prefers-reduced-motion`. O infantil
tinha duas animações que **nunca paravam** — a peça do quebra-cabeça dançando
e a dica da abertura pulsando.

**O cuidado extra:** onde o movimento era o único sinal de um estado, ele não
some — vira um sinal estático. O parágrafo onde a criança parou de ler
continua marcado, sem piscar.

### 3.10 Impressão: sempre A4, e o desenho cabe

Regra vinda de teste real com as crianças: **nada de desenho quebrando em três
páginas.** A orientação sai da proporção da arte — retrato ou paisagem — e não
de um padrão fixo.

As letras do alfabeto para pintar não são fonte: são **contornos vetoriais**
extraídos no momento da construção. Imprimem com traço limpo em qualquer
tamanho.

---

## 4. As decisões pedagógicas

Estas não são de acessibilidade visual, mas são as que mais interessam à
disciplina.

### 4.1 Quiz sem trava: nada bloqueia o avanço

A criança toca em qualquer alternativa — certa ou errada. O app **sempre**
revela a resposta correta com uma explicação curta, e libera a continuação.

Não é prova. É reforço de leitura.

### 4.2 A nota existe e nunca é mostrada

Tentativas e acertos são gravados — e **nunca exibidos à criança**. Servem, no
máximo, para um resumo ao adulto ("este mês, X livros lidos"), nunca como
pressão sobre o filho.

**Progressão se dá por participação, jamais por acerto.**

### 4.3 Recompensa fixa, nunca aleatória

Terminar o livro X sempre dá a insígnia Y. Sem sorteio, sem caixa surpresa.

O motivo é explícito no projeto: recompensa aleatória é exatamente o gatilho
de dopamina que o app existe para **não** reproduzir. Um app que se propõe a
competir com conteúdo viciante e usa a mecânica do conteúdo viciante venceu a
batalha e perdeu a guerra.

Esta decisão veio de teste com as crianças: elas pediram insígnias no estilo
das que já conheciam — **fixas, previsíveis, sem sorte.**

### 4.4 Trocar de perfil não passa por trava

O app sempre abre na escolha de perfil, com avatar grande e nome, sem texto
pequeno — para uma criança de 7 anos escolher sozinha.

Trocar de perfil com o app aberto **não** passa pela trava dos pais: é ação
normal entre irmãos que dividem um tablet. A trava fica só para configurações
e exclusão de dados.

### 4.5 O conteúdo tem procedência declarada

Todo texto é de domínio público, com tradução própria documentada. Cada
arquivo declara autor, idioma de origem, tradutor, licença e faixa etária.

O final de *A Lebre e a Tartaruga* é **autoral dos dois meninos** — e está
registrado como deles.

---

## 5. O que não está resolvido

Uma lista de pendências é parte do trabalho, não uma falha dele.

- **Hebraico e árabe** não estão em nenhuma das fontes embutidas; dependem do
  aparelho.
- **Teto de letra do infantil** para em 180 px, não em 256.
- **Sem teste com usuário externo.** Os testes foram com dois leitores de 7 e
  9 anos e um leitor com baixa visão — não com uma criança cega, nem com
  leitor de tela de verdade em uso real.
- **Nenhuma validação com fonoaudiologia, terapia ocupacional ou pedagogia
  especializada.** Este trabalho é de quem projeta e mede, não de quem
  diagnostica.

---

## 6. O que este trabalho demonstra

Uma frase para o final da apresentação, se servir:

> Acessibilidade não é uma lista de itens a marcar no fim do projeto. É uma
> régua que decide o projeto inteiro desde o começo — e que se **mede**, não
> se declara.

O que separa este trabalho de uma boa intenção não é o tempo. É que cada
afirmação tem um número atrás, e que os erros foram achados **medindo**, não
supondo: o amarelo que colapsava sob tritanopia, o grego que era lido em
silêncio por uma voz portuguesa, o vão de 48,6 px entre parágrafos que fazia
rolar por vazio.

Todos os três estavam invisíveis a olho nu, no trabalho de alguém que já
estava tentando acertar.

---

## 7. Como demonstrar ao vivo

Sugestão de roteiro curto, se houver projeção:

1. Abrir a estante e apertar **A+** cinco vezes. A letra vai de 20 a 37 px e
   os cartões acompanham.
2. Trocar para o tema **Alto contraste** — some o papel de parede, porque nada
   pode competir com o texto em baixa visão.
3. Abrir o livro do alfabeto grego e mostrar uma letra.
4. Responder uma pergunta do quiz **errado de propósito**: o app revela a
   correta, explica, e deixa seguir.
5. Imprimir uma folha de pintar.

O passo 4 costuma ser o que muda a cara das pessoas.

---

*Este dossiê acompanha os repositórios `app-infantil` e `app-leitura`. As
medições podem ser refeitas: `python scripts/medir_contraste.py` no
app-leitura devolve a tabela do item 3.1 na hora.*
