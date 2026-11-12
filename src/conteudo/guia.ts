// Guia de quem ensina — para professoras, professores, mães, pais e quem lê
// junto. Fica atrás da trava dos adultos (Ajustes): a leitura do app fala
// com a criança; a conversa com o adulto é AQUI (decisão de 14/10/2026,
// docs/MEMORIA_PEDAGOGICA.md).
//
// Regra deste texto: explicar o porquê de cada recurso sem prometer o que
// ninguém mediu. Onde o app não foi testado com crianças, o guia diz.

export interface SecaoDoGuia {
  titulo: string;
  paragrafos: string[];
}

export const TITULO_DO_GUIA = 'Guia de quem ensina';

export const GUIA: SecaoDoGuia[] = [
  {
    titulo: 'Para que serve o Historinhas',
    paragrafos: [
      'O Historinhas junta três coisas: ler (ou ouvir) uma história curta, conversar sobre ela com uma pergunta, e pintar. Tudo funciona sem internet depois da primeira visita, e nada do que a criança faz sai do aparelho.',
      'Ele foi pensado para que a mesma atividade sirva a crianças diferentes. Por isso quase tudo tem mais de um caminho: ler ou ouvir, tocar ou escolher numa lista, pintar na tela ou no papel.',
      'Um aviso honesto: o app nasceu em família e ainda não foi avaliado de forma organizada com crianças com deficiência nem com turmas. O que este guia descreve é a intenção de cada recurso e o que foi medido na máquina. Sua observação em sala vale mais do que qualquer número daqui — e é bem-vinda.',
    ],
  },
  {
    titulo: 'Sem nota, sem pressa, sem sorte',
    paragrafos: [
      'Nas perguntas, qualquer resposta revela a certa e a explicação, e a criança segue adiante. O app nunca mostra placar nem percentual de acertos. A ideia é que errar seja só um jeito de chegar à explicação.',
      'Nada tem tempo contado. As recompensas (insígnias) são fixas e previsíveis: terminar um livro dá sempre a mesma insígnia. Não há sorteio.',
      'As folhas de números e de letras não têm gabarito, e as caixas de resposta ficam em branco de propósito. Quem confere é a criança, contando — com você ao lado, se ela quiser.',
    ],
  },
  {
    titulo: 'A letra: tamanho, espaço e peso',
    paragrafos: [
      'No botão 🎨 (Aparência) cada perfil escolhe a sua letra, e a escolha fica guardada só para aquela criança.',
      'Tamanho: os botões A− e A+ estão sempre na barra do alto. O texto se rearruma sem precisar rolar de lado, e a leitura não perde o lugar.',
      'Espaço entre as linhas: há quatro medidas. Linhas mais afastadas ajudam quem se perde ao passar de uma linha para a outra. Para algumas condições da visão — o ceratocone é o exemplo mais claro — a pessoa vê uma segunda imagem, mais fraca, de cada letra; se as linhas estão juntas, essa sombra de uma linha cai em cima da de baixo. Afastar as linhas separa uma da outra. O mesmo ajuste costuma ser pedido por pessoas com astigmatismo, baixa visão e dislexia.',
      'Espaço entre as letras: três medidas. Letras muito juntas podem se fundir para quem vê borrado. O espaço entre as palavras cresce junto, para a palavra continuar sendo um bloco.',
      'Peso da letra: Fina, Média ou Grossa. Um traço mais grosso devolve a parte fina da letra que some quando a vista embaça.',
      'Fonte: Cardo (com serifa), Atkinson Hyperlegible (desenhada para baixa visão) e OpenDyslexic (desenhada pensando em dislexia). Nenhuma é "a certa": deixe a criança experimentar e ficar com a que ela lê melhor.',
      'Isto não substitui avaliação de saúde nem de visão. São ajustes de conforto e de acesso; se uma criança só consegue ler com a letra enorme e muito espaçada, vale conversar com a família.',
    ],
  },
  {
    titulo: 'Temas e contraste',
    paragrafos: [
      'Há quatro temas prontos, entre eles o "Alto contraste" (fundo preto, letra branca, destaques em amarelo). Quem precisa de alto contraste fica com ele sempre: o tema decorativo de um livro nunca passa por cima.',
      'O app respeita a opção "reduzir movimento" do aparelho: confetes e animações deixam de se mexer.',
    ],
  },
  {
    titulo: 'Ouvir',
    paragrafos: [
      'Cada parágrafo tem um botão 🔊; cada capítulo também; e há "Ouvir a história" no alto do livro. As perguntas e as explicações também se ouvem — a voz lê as opções sem dizer qual é a certa.',
      'Enquanto a voz lê, o trecho fica marcado na tela, para a criança ligar o som à palavra.',
      'A voz é a do próprio aparelho, então muda de um celular para outro. Se não houver voz em português instalada, o botão pode ficar mudo.',
    ],
  },
  {
    titulo: 'A régua de leitura',
    paragrafos: [
      'O botão 📏 Régua, no alto de cada livro, escurece a tela e deixa clara só uma faixa. A criança rola o texto e lê o que passa pela faixa. É o mesmo princípio da régua de papel com uma janela recortada, usada por quem pula de linha.',
    ],
  },
  {
    titulo: 'Pintar',
    paragrafos: [
      'As cores têm nome, e o nome da cor escolhida fica sempre escrito. Isso importa para o daltonismo: quem confunde vermelho, verde e marrom lê o nome em vez de adivinhar. A paleta está arrumada em xadrez de cores "quentes" e "frias", para que duas cores que se confundem nunca fiquem encostadas. Cada cor tem cinco tons (botão "Tons"). O botão 🔊 ao lado do nome faz o app falar a cor.',
      'Há três jeitos de pintar. O balde 🪣 pinta uma região inteira com um toque. O pincel 🖌️ é traço livre. E o botão 📋 abre "Escolha uma parte e pinte": a criança anda pelas partes do desenho com as setas ou por uma lista, vê o contorno da parte destacado e aperta um botão grande para pintar — sem precisar acertar o dedo num lugar pequeno. Serve a quem tem pouca coordenação fina, usa teclado ou acionador.',
      'A lupa 🔍 amplia o desenho até quatro vezes; com zoom aparecem setas para andar pela imagem. Tudo o que se faz com dois dedos também se faz com um toque.',
      'Um limite que você deve conhecer: para uma criança cega, pintar ainda não funciona bem. A lista de partes existe, mas na maioria dos desenhos as partes se chamam "detalhe 12", não "sol" ou "casa".',
    ],
  },
  {
    titulo: 'Imprimir',
    paragrafos: [
      'Toda impressão é pensada para folha A4. Na tela de pintar, o botão 🖨️ pergunta: "Só o contorno, para pintar no papel" ou "Do jeito que eu pintei".',
      'Nos livros "O Alfabeto", "O Alfabeto Grego" e "Os Números", os botões do alto imprimem a folha-resumo ou o caderno inteiro.',
      'No iPhone, com o app instalado na tela inicial, a folha sai como imagem pelo botão de compartilhar (de onde se escolhe Imprimir). Para o caderno completo, abra historinhas.app.br no Safari.',
    ],
  },
  {
    titulo: 'As folhas de letras',
    paragrafos: [
      'Cada letra tem uma folha com a mesma estrutura: observar e pintar as duas formas, encontrar a letra entre outras, e um espaço livre para escrever ou desenhar. A estrutura repetida é proposital: a criança aprende o caminho uma vez.',
      'O alfabeto grego segue a pronúncia do grego antigo (ática), explicada nas próprias folhas.',
      'Em toda folha a criança pode participar pintando, apontando, falando ou escrevendo. Se a escrita ainda não vem, apontar e falar já é fazer a atividade.',
    ],
  },
  {
    titulo: 'As folhas de números',
    paragrafos: [
      'De zero a dez, cada número tem uma folha: o algarismo grande, a quantidade num quadro de dez casas, estrelas para contar, o número escondido entre outros, a casinha dele na reta e uma linha para escrever. A quantidade vem sempre junto do símbolo.',
      'As quatro operações aparecem como ação com bolinhas — juntar, tirar, formar grupos iguais, repartir — antes de aparecerem como conta. Cada folha termina na reta de zero a dez, para a criança conferir pulando com o dedo, e num convite para inventar a própria conta.',
      'A tabuada é um tabuleiro para pintar e procurar padrões, não uma lista para decorar.',
      'Os algarismos das folhas não têm o corte no zero que algumas fontes usam. O "1" tem bandeirinha e o "4" é fechado; se a sua turma escreve de outro jeito, vale mostrar as duas formas.',
    ],
  },
  {
    titulo: 'Perfis, cópia e privacidade',
    paragrafos: [
      'Cada criança tem um perfil com as suas leituras, pinturas, insígnias e a sua letra. Trocar de perfil não pede senha: toque no avatar, no alto, e em "Trocar de perfil".',
      'Criar e apagar perfis fica nesta área dos adultos. Aqui também está a cópia de segurança: "Guardar uma cópia" grava tudo num arquivo, que você leva a outro aparelho com "Trazer de uma cópia". Trazer uma cópia troca tudo o que está no aparelho.',
      'O app não tem cadastro, não pede e-mail e não envia nada pela internet. Limpar os dados do navegador apaga tudo — por isso a cópia.',
    ],
  },
  {
    titulo: 'Ideias para a sala',
    paragrafos: [
      'Leitura em roda: projete a história, ligue a régua de leitura e deixe que as crianças se revezem tocando no 🔊 de cada parágrafo.',
      'Pergunta sem certo e errado: antes de tocar numa resposta, peça que cada um diga por que escolheria aquela. A explicação do app entra depois, como mais uma voz.',
      'Pintura em duplas: uma criança escolhe a parte na lista e diz a cor; a outra aperta para pintar. Depois trocam.',
      'Do digital ao papel: imprima "só o contorno" para todos e compare as pinturas; ou imprima "do jeito que eu pintei" para a criança levar para casa.',
    ],
  },
  {
    titulo: 'O que o app ainda não faz bem',
    paragrafos: [
      'Não foi testado com leitor de tela (VoiceOver, TalkBack) por uma pessoa cega. Os botões têm nome e a ordem é lógica, mas ninguém ouviu o app do começo ao fim.',
      'Os desenhos não têm descrição falada do que mostram.',
      'Não há vídeo, língua de sinais nem legenda — e também não há nada que dependa só de som.',
      'A interface está só em português.',
      'Se alguma coisa atrapalhar uma criança sua, conte: o app melhora com esse retorno.',
    ],
  },
];
