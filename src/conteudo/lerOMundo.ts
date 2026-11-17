// LER O MUNDO (nome provisório) — letramento para jovens e adultos.
//
// Nasceu de um pedido de uma professora de AEE (nov/2026): adolescentes do
// ensino médio ainda não alfabetizados têm vergonha de "coisa de criancinha".
// Mesmo motor das folhas de alfabeto e de números, outra cara:
//   • a marca no cabeçalho NÃO é "Historinhas" (a folha fica na carteira, à
//     vista dos colegas);
//   • ninguém "pinta": destaca, circula, marca — gesto de marca-texto;
//   • a unidade é a PALAVRA que aparece na rua, no ônibus, no celular, no
//     documento — e só depois as partes dela;
//   • o tom é de adulto: frase curta, sem diminutivo, sem bichinho.
//
// O catálogo abaixo é o "formato padrão pronto". A professora pode gerar a
// mesma ficha para QUALQUER palavra do aluno (fichaDePalavraPropria): o nome
// dele, a linha do ônibus, o time, o jogo.
//
// Decisões em aberto e o que falta: docs/LER_O_MUNDO.md.

import type { FichaAlfabeto } from './alfabetos';
import {
  svgCatalogoA4,
  svgDinheiroA4,
  svgFormularioA4,
  svgHoraA4,
  svgPalavraA4,
} from './lerOMundoArte';

export const ID_CADERNO_LER_O_MUNDO = 'ler-o-mundo';

/** Como a palavra aparece no mundo: a moldura do passo 1 da ficha. */
export type Contexto =
  | 'octogono' // PARE
  | 'alerta' // triângulo com "!"
  | 'proibido' // círculo cortado
  | 'seta' // placa com seta (saída, entrada)
  | 'porta' // plaquinha ao lado de uma porta
  | 'letreiro' // letreiro na frente do ônibus
  | 'poste' // placa num poste (parada)
  | 'etiqueta' // etiqueta de preço
  | 'tela' // botão numa tela de celular
  | 'documento' // campo de formulário
  | 'placa'; // placa simples

export interface PalavraDoMundo {
  /** sempre em maiúsculas: é assim que a palavra aparece nas placas */
  palavra: string;
  /** separação conferida à mão; ausente = a ficha mostra letra por letra */
  silabas?: string[];
  contexto: Contexto;
  /** quatro palavras de verdade, parecidas na forma, para o passo "encontre" */
  parecidas?: string[];
  /** onde a palavra costuma aparecer (passo 5) */
  onde?: string;
}

export interface GrupoDePalavras {
  id: string;
  titulo: string;
  palavras: PalavraDoMundo[];
}

const p = (
  palavra: string,
  silabas: string,
  contexto: Contexto,
  parecidas: string,
  onde: string,
): PalavraDoMundo => ({
  palavra,
  silabas: silabas.split('-'),
  contexto,
  parecidas: parecidas.split(' '),
  onde,
});

// Critério do catálogo: palavra que protege (segurança), que orienta (lugares,
// portas, transporte) ou que dá autonomia (dinheiro, documento, celular).
// Sílabas separadas à mão; encontros como -CIA e -RIO ficam numa sílaba só,
// como na fala corrente.
export const CATALOGO: GrupoDePalavras[] = [
  {
    id: 'seguranca',
    titulo: 'Segurança',
    palavras: [
      p('PARE', 'PA-RE', 'octogono', 'PARA PERA PATO PAGUE', 'Na esquina. No portão da garagem.'),
      p('ATENÇÃO', 'A-TEN-ÇÃO', 'alerta', 'ATENDE ATRASO ESTAÇÃO ATALHO', 'Em obras. Em avisos da escola.'),
      p('CUIDADO', 'CUI-DA-DO', 'alerta', 'CIDADE CUIDAR CURADO QUADRO', 'No piso molhado. Perto de degraus.'),
      p('PERIGO', 'PE-RI-GO', 'alerta', 'PEDIDO PERITO AMIGO PERTO', 'Em fios de luz. Em produtos de limpeza.'),
      p('PROIBIDO', 'PRO-I-BI-DO', 'proibido', 'PERMITIDO PRODUTO PROVADO RECIBO', 'Em portas. Em estacionamentos.'),
      p('EMERGÊNCIA', 'E-MER-GÊN-CIA', 'placa', 'URGÊNCIA AGÊNCIA ENERGIA EMPRESA', 'No hospital. Na porta do ônibus.'),
      p('SAÍDA', 'SA-Í-DA', 'seta', 'SAÚDE SALA SAIA SUBIDA', 'Em cima das portas. No shopping. No ônibus.'),
      p('ENTRADA', 'EN-TRA-DA', 'seta', 'ENTREGA ESTRADA ENTRE ENCONTRA', 'Em lojas. No estádio. No cinema.'),
    ],
  },
  {
    id: 'lugares',
    titulo: 'Lugares',
    palavras: [
      p('BANHEIRO', 'BA-NHEI-RO', 'porta', 'BARBEIRO BANCO BAIRRO DINHEIRO', 'Na escola. No shopping. Na rodoviária.'),
      p('MASCULINO', 'MAS-CU-LI-NO', 'porta', 'MÁSCARA MENINO MÚSCULO FEMININO', 'Na porta do banheiro. Em lojas de roupa.'),
      p('FEMININO', 'FE-MI-NI-NO', 'porta', 'MENINO FERIADO MASCULINO FAMÍLIA', 'Na porta do banheiro. Em lojas de roupa.'),
      p('ELEVADOR', 'E-LE-VA-DOR', 'porta', 'ELEFANTE ESCADA LAVADOR ELETRO', 'Em prédios. No hospital.'),
      p('ESCADA', 'ES-CA-DA', 'placa', 'ESCOLA ESTRADA ESCOVA ESCUTA', 'Em prédios. Ao lado do elevador.'),
      p('FARMÁCIA', 'FAR-MÁ-CIA', 'placa', 'FAMÍLIA FARINHA FÁBRICA FARDA', 'Na rua. No letreiro da loja.'),
      p('HOSPITAL', 'HOS-PI-TAL', 'placa', 'HOTEL HORÁRIO POSTAL HOSPEDA', 'Em placas de rua. No letreiro do ônibus.'),
      p('MERCADO', 'MER-CA-DO', 'placa', 'MERENDA MARCADO RECADO CERCADO', 'Na rua. Em sacolas e folhetos.'),
      p('ESCOLA', 'ES-CO-LA', 'placa', 'ESCADA ESCOVA ESCOLHA SACOLA', 'No portão. No uniforme. Em placas de rua.'),
    ],
  },
  {
    id: 'portas',
    titulo: 'Portas e avisos',
    palavras: [
      p('EMPURRE', 'EM-PUR-RE', 'porta', 'EMPRESA EMBARQUE ENTRE EMPURRA', 'Em portas de vidro.'),
      p('PUXE', 'PU-XE', 'porta', 'PULE PEIXE PUXA LUXO', 'Em portas de vidro.'),
      p('ABERTO', 'A-BER-TO', 'placa', 'APERTO ABERTA ABRIL COBERTO', 'Na porta de lojas.'),
      p('FECHADO', 'FE-CHA-DO', 'placa', 'FERIADO FECHADA FICHA RACHADO', 'Na porta de lojas.'),
    ],
  },
  {
    id: 'transporte',
    titulo: 'Ônibus e transporte',
    palavras: [
      p('ÔNIBUS', 'Ô-NI-BUS', 'letreiro', 'ÓCULOS BÔNUS ÚNICO ANIMAIS', 'Na parada. Na faixa da rua. No cartão.'),
      p('PARADA', 'PA-RA-DA', 'poste', 'PARADO PAREDE PANCADA PARA', 'Na calçada. No aplicativo de ônibus.'),
      p('LINHA', 'LI-NHA', 'poste', 'LENHA LINDA MINHA LIXA', 'Na parada. Na tabela de horários.'),
      p('CENTRO', 'CEN-TRO', 'letreiro', 'CENTO DENTRO CINTO CONTRA', 'No letreiro do ônibus. Em placas de rua.'),
      p('BAIRRO', 'BAIR-RO', 'letreiro', 'BARRO BURRO BAIXO CARRO', 'No letreiro do ônibus. Em contas e cartas.'),
      p('TERMINAL', 'TER-MI-NAL', 'letreiro', 'TERMINA TERRENO NORMAL TRIBUNAL', 'No letreiro do ônibus. Em placas.'),
      p('PASSAGEM', 'PAS-SA-GEM', 'etiqueta', 'PASSEIO MASSAGEM PASSADO PAISAGEM', 'Na roleta. No cartão. Na rodoviária.'),
      p('MOTORISTA', 'MO-TO-RIS-TA', 'placa', 'MOTOR MOTOCA TURISTA MORADIA', 'Dentro do ônibus. No crachá.'),
    ],
  },
  {
    id: 'compras',
    titulo: 'Dinheiro e compras',
    palavras: [
      p('PREÇO', 'PRE-ÇO', 'etiqueta', 'PRETO PRAÇA PRESO PREGO', 'Na prateleira. Na etiqueta. No folheto.'),
      p('TROCO', 'TRO-CO', 'etiqueta', 'TRONCO TRUCO TOCO TROCA', 'No caixa. Na nota da compra.'),
      p('CAIXA', 'CAI-XA', 'placa', 'BAIXA CASA FAIXA CAIXÃO', 'No mercado. No banco.'),
      p('VALIDADE', 'VA-LI-DA-DE', 'etiqueta', 'VERDADE VAIDADE VONTADE CIDADE', 'Em comida. Em remédio.'),
      p('PAGAR', 'PA-GAR', 'tela', 'PEGAR APAGAR PASSAR LUGAR', 'Na maquininha. No aplicativo do banco.'),
    ],
  },
  {
    id: 'documentos',
    titulo: 'Documentos',
    palavras: [
      p('NOME', 'NO-ME', 'documento', 'NOVE FOME NOTA NOSSO', 'Em fichas. Em provas. Em cadastros.'),
      p('DATA', 'DA-TA', 'documento', 'LATA DAMA DADO BATA', 'Em fichas. Em provas. Em receitas.'),
      p('ASSINATURA', 'AS-SI-NA-TU-RA', 'documento', 'ASSINAR ABERTURA LITERATURA ASSISTIR', 'No fim de fichas e contratos.'),
      p('ENDEREÇO', 'EN-DE-RE-ÇO', 'documento', 'ENTREGA ENGRAÇADO ADEREÇO ENCONTRO', 'Em cadastros. Em encomendas.'),
      p('TELEFONE', 'TE-LE-FO-NE', 'documento', 'TELEVISÃO TELHADO MICROFONE TELA', 'Em cadastros. Em cartões.'),
    ],
  },
  {
    id: 'celular',
    titulo: 'Celular',
    palavras: [
      p('SENHA', 'SE-NHA', 'tela', 'SENHOR LENHA SENTA SONHA', 'No celular. No banco. No wi-fi.'),
      p('ENTRAR', 'EN-TRAR', 'tela', 'ENTRE ENTRADA ENCONTRAR ENTREGAR', 'Em aplicativos e sites.'),
      p('SAIR', 'SA-IR', 'tela', 'SAIA SUBIR SALA CAIR', 'Em aplicativos e sites.'),
      p('ENVIAR', 'EN-VI-AR', 'tela', 'ENTRAR ENFIAR ESPIAR ENSINAR', 'Em mensagens. Em formulários.'),
    ],
  },
];

export const TODAS_AS_PALAVRAS: PalavraDoMundo[] = CATALOGO.flatMap((g) => g.palavras);

/** id estável de uma palavra: sem acento, minúsculo (SAÍDA → saida). */
export function idDaPalavra(palavra: string): string {
  return palavra
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const LETRAS_ACEITAS = /^[A-ZÁÉÍÓÚÂÊÔÃÕÀÇ]+$/u;

/**
 * A ficha de uma palavra que NÃO está no catálogo: o nome do aluno, a linha do
 * ônibus, o time. É o que a professora personaliza.
 *
 * Sem `silabas`, a ficha mostra letra por letra — o app não adivinha a
 * separação silábica (errar aqui ensinaria errado). Sem `parecidas`, o passo
 * "encontre" usa palavras do catálogo de tamanho próximo.
 */
export function fichaDePalavraPropria(entrada: {
  palavra: string;
  silabas?: string[];
  contexto?: Contexto;
  parecidas?: string[];
  onde?: string;
}): PalavraDoMundo {
  const palavra = entrada.palavra.trim().toLocaleUpperCase('pt-BR');
  if (!LETRAS_ACEITAS.test(palavra)) {
    throw new Error(`Só letras, numa palavra só: "${entrada.palavra}"`);
  }
  if (palavra.length > 14) throw new Error(`Palavra longa demais para a ficha: "${palavra}"`);
  const silabas = entrada.silabas?.map((s) => s.trim().toLocaleUpperCase('pt-BR'));
  if (silabas && silabas.join('') !== palavra) {
    throw new Error(`As partes não formam a palavra: ${silabas.join('-')} ≠ ${palavra}`);
  }
  return {
    palavra,
    silabas,
    contexto: entrada.contexto ?? 'placa',
    parecidas: entrada.parecidas?.map((s) => s.trim().toLocaleUpperCase('pt-BR')),
    onde: entrada.onde,
  };
}

/**
 * Quatro palavras para o passo "encontre": as indicadas à mão ou, na falta,
 * as do catálogo com tamanho mais próximo (de preferência a mesma inicial).
 */
export function parecidasDe(alvo: PalavraDoMundo): string[] {
  if (alvo.parecidas?.length === 4) return alvo.parecidas;
  const candidatas = TODAS_AS_PALAVRAS.map((x) => x.palavra).filter((x) => x !== alvo.palavra);
  const nota = (x: string) =>
    Math.abs(x.length - alvo.palavra.length) - (x[0] === alvo.palavra[0] ? 1.5 : 0);
  return [...candidatas].sort((a, b) => nota(a) - nota(b) || a.localeCompare(b, 'pt-BR')).slice(0, 4);
}

export function gerarCadernoLerOMundo(): FichaAlfabeto[] {
  const fichas: FichaAlfabeto[] = [];
  const add = (id: string, titulo: string, svg: string, grupo: string) =>
    fichas.push({ id, arquivo: `${ID_CADERNO_LER_O_MUNDO}_${id}.svg`, titulo, svg, grupo });

  for (const grupo of CATALOGO) {
    add(`consulta-${grupo.id}`, `${grupo.titulo}: palavras para reconhecer`, svgCatalogoA4(grupo), 'Consulta');
  }
  for (const grupo of CATALOGO) {
    for (const palavra of grupo.palavras) {
      add(`palavra-${idDaPalavra(palavra.palavra)}`, palavra.palavra, svgPalavraA4(palavra), grupo.titulo);
    }
  }
  add('formulario', 'Preencher uma ficha', svgFormularioA4(), 'Documentos');
  add('dinheiro', 'Dinheiro: notas e moedas', svgDinheiroA4(), 'Números do dia a dia');
  add('hora', 'Hora e horário de ônibus', svgHoraA4(), 'Números do dia a dia');
  return fichas;
}
