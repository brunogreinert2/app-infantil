# Historinhas — Primeiras Aventuras

12 novas histórias, 24 cenas e 3 cenas adicionais para fábulas já existentes.
As histórias têm dois capítulos curtos, diálogo e duas perguntas de compreensão.
As 27 imagens originais são SVG puro, em preto e branco, com regiões fechadas
para pintar e composição horizontal para folha A4. O app usa a mesma imagem
na pintura, no quebra-cabeça e na impressão.

## Para ler, brincar e imprimir

Abra `LEIA-AS-HISTORIAS.html` para ler e ver todos os desenhos, mesmo sem internet
e sem JavaScript. O caderno `historinhas-primeiras-aventuras-A4.pdf` tem uma cena
por página, em A4 paisagem. Imprima em tamanho real (100%), sem cabeçalhos do
navegador. Os SVGs em `svg/` são os mesmos arquivos usados pelo aplicativo;
os textos editáveis estão em `livros/`.

Na escola, deixe cada criança escolher a história, a cor e a quantidade de peças.
Leitura compartilhada, descrição oral da cena e apontar uma resposta são formas
de participar. Não há prova nem nota para a criança. As perguntas são convites
para conversar; uma resposta diferente pode iniciar uma nova leitura.

O desenho maior favorece o uso em papel, mas não substitui adaptação individual:
ampliar uma cena, reduzir a quantidade de peças ou oferecer apoio motor pode ser
útil conforme a atividade. Não se promete adequação universal a uma deficiência.

## Proveniência e escolhas editoriais

Textos em português e desenhos foram feitos para Historinhas. São adaptações
livres de enredos, não edições integrais nem traduções literais. As fontes abaixo
são edições históricas em inglês usadas para conferir os enredos; não foram
copiadas traduções brasileiras modernas nem ilustrações dessas edições.
`fonte_idioma` identifica a língua da tradição/autor, não uma alegação de tradução
direta do grego, alemão ou dinamarquês.

Esopo pertence à Antiguidade; Jacob Grimm morreu em 1863, Wilhelm Grimm em 1859,
e Hans Christian Andersen em 1875. Os enredos originais estão em domínio público
no Brasil pelo prazo do art. 41 da Lei 9.610/1998. O selo “public domain in the
USA” do Gutenberg, isoladamente, não foi usado como prova de situação brasileira.
O conteúdo próprio desta coleção segue o campo CC0 do projeto.

Referência legal: https://www.gov.br/aeb/pt-br/acesso-a-informacao/institucional/legislacao/L9610.pdf
Catálogo de Esopo: https://read.gov/aesop/001.html
Autores Grimm: https://www.gutenberg.org/ebooks/2591
Autor Andersen: https://www.gutenberg.org/ebooks/1597

### O Corvo e o Jarro

Autor/tradição: Esopo. Fonte consultada: https://read.gov/aesop/012.html

Linguagem, diálogos e detalhes de cena próprios; sequência central da fábula preservada.

### A Raposa e a Cegonha

Autor/tradição: Esopo. Fonte consultada: https://read.gov/aesop/016.html

O desfecho acrescenta conversa e reparação ao convite de retribuição da fábula.

### O Rato do Campo e o Rato da Cidade

Autor/tradição: Esopo. Fonte consultada: https://read.gov/aesop/004.html

Linguagem, diálogos e detalhes de cena próprios; sequência central da fábula preservada.

### A Formiga e a Pomba

Autor/tradição: Esopo. Fonte consultada: https://read.gov/aesop/028.html

A perseguição é mostrada sem arma nem ferimento; a formiga alerta a ave com uma picada no sapato do perseguidor.

### O Cachorro e o Reflexo

Autor/tradição: Esopo. Fonte consultada: https://read.gov/aesop/026.html

O cachorro permanece na ponte; o susto não envolve salto na água. O erro não é tratado como sinal de falta de inteligência.

### O Galo e a Pérola

Autor/tradição: Esopo. Fonte consultada: https://read.gov/aesop/058.html

A joia genérica é uma pérola; o reencontro com quem a perdeu é um acréscimo autoral.

### O Carvalho e os Juncos

Autor/tradição: Esopo. Fonte consultada: https://read.gov/aesop/011.html

O temporal derruba um galho, em vez de arrancar a árvore inteira; a conversa final é autoral.

### Os Ratinhos e o Sino

Autor/tradição: Esopo. Fonte consultada: https://read.gov/aesop/003.html

Linguagem, diálogos e detalhes de cena próprios; sequência central da fábula preservada.

### A Panela de Mingau

Autor/tradição: Irmãos Grimm. Fonte consultada: https://www.gutenberg.org/cache/epub/52521/pg52521-images.html

Adaptação de Sweet Porridge (KHM 103), com partilha e limpeza coletiva no desfecho.

### Os Duendes e o Sapateiro

Autor/tradição: Irmãos Grimm. Fonte consultada: https://www.gutenberg.org/files/2591/2591-h/2591-h.htm#chap39

Os duendes usam roupas gastas; o presente final permite que partam para novas aventuras.

### A Roupa Nova do Imperador

Autor/tradição: Hans Christian Andersen. Fonte consultada: https://www.gutenberg.org/files/1597/1597-h/1597-h.htm

O imperador desfila de camiseta e calção; o final acrescenta reconhecimento do engano, sem exposição corporal ou humilhação prolongada.

### O Patinho e Seu Lugar

Autor/tradição: Hans Christian Andersen. Fonte consultada: https://www.gutenberg.org/cache/epub/32571/pg32571-images.html

Adaptação livre de O Patinho Feio. Abrevia perseguições e acrescenta acolhimento antes da descoberta; não associa valor pessoal à beleza ou à transformação.

## Integração e continuidade

Registro: `src/conteudo/colecaoPrimeirasAventuras.ts`, incorporado ao catálogo.
Os três livros antes sem arte receberam apenas declaração de asset e uma âncora
de imagem no final; texto, IDs de livro e âncoras de parágrafos foram preservados.
Nenhum SVG antigo nem arquivo de `src/motor/` foi alterado.

As máscaras de oclusão impedem que linhas escondidas atrás de personagens
apareçam quando o app retira o preenchimento na impressão e na camada de linhas.
Não remova os `mask`, não renomeie `regiao-*` e não reordene as formas depois de
publicar: a pintura das crianças depende desses identificadores.

Reprodução das artes: `python scripts/primeiras-aventuras/artes.py DIRETORIO_TEMP`.
Depois aplique `adicionarMascaras` de `mascaras.mjs` ao SVG montado num navegador.
O gerador não é executado no build. O app importa os SVGs finais já processados.
Compare visualmente antes de substituir qualquer arte publicada.

Próximas coleções sugeridas: contos de Monteiro Lobato selecionados obra a obra,
novos capítulos de O Pequeno Príncipe e contos populares brasileiros. Manter
lotes revisáveis, com fontes e mudanças editoriais documentadas em cada um.
Esta entrega não afirma que os livros citados nessa fila já foram preparados.
