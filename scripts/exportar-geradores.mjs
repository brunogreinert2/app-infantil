// Gera uma amostra de cada gerador de src/geradores/ em SVG, mais uma página
// "amostra.html" com todas lado a lado (para conferir de olho ou imprimir).
//   node scripts/exportar-geradores.mjs <pasta>
import { createServer } from 'vite';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const destino = process.argv[2] ?? 'geradores-exportados';
mkdirSync(destino, { recursive: true });
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const caca = await server.ssrLoadModule('/src/geradores/cacaPalavras.ts');
  const cruz = await server.ssrLoadModule('/src/geradores/cruzadinha.ts');
  const p = await server.ssrLoadModule('/src/geradores/papeis.ts');
  const j = await server.ssrLoadModule('/src/geradores/jogosDeMesa.ts');
  const mat = await server.ssrLoadModule('/src/geradores/matematica.ts');
  const horas = mat.lerHoras('7:00\n7:15\n12:30\n3:45\n9:10\n6:50');
  const pecas = j.lerPecas('FELIZ\nTRISTE\nBRAVO\nCASA\nÔNIBUS\nÁGUA\nSUCO\nPÃO\nFRUTA\nLIVRO\nLÁPIS\nMÚSICA\nTHEO');

  const transporte = ['ÔNIBUS', 'PARADA', 'LINHA', 'CENTRO', 'BAIRRO', 'TERMINAL', 'PASSAGEM', 'MOTORISTA'];
  const facil = caca.gerarCacaPalavras({ palavras: transporte, nivel: 'facil' });
  const dificil = caca.gerarCacaPalavras({ palavras: transporte, nivel: 'dificil' });
  const escola = cruz.gerarCruzadinha([
    { palavra: 'CADERNO', dica: 'Onde a gente escreve na aula.' },
    { palavra: 'LÁPIS', dica: 'Escreve e pode ser apagado.' },
    { palavra: 'RECREIO', dica: 'Hora de brincar e lanchar.' },
    { palavra: 'MERENDA', dica: 'A comida da escola.' },
    { palavra: 'PROFESSORA', dica: 'Quem ensina a turma.' },
    { palavra: 'BORRACHA', dica: 'Apaga o que o lápis escreveu.' },
    { palavra: 'MOCHILA', dica: 'Leva o material nas costas.' },
    { palavra: 'LIVRO', dica: 'Tem páginas e histórias.' },
  ]);
  const hoje = new Date();

  const folhas = {
    'caca-palavras-facil': caca.svgCacaPalavrasA4(facil, { titulo: 'Ônibus e transporte' }),
    'caca-palavras-facil-respostas': caca.svgCacaPalavrasA4(facil, { titulo: 'Ônibus e transporte', gabarito: true }),
    'caca-palavras-dificil': caca.svgCacaPalavrasA4(dificil, { titulo: 'Ônibus e transporte' }),
    'caca-palavras-dificil-respostas': caca.svgCacaPalavrasA4(dificil, { titulo: 'Ônibus e transporte', gabarito: true }),
    'cruzadinha': cruz.svgCruzadinhaA4(escola, { titulo: 'Coisas da escola' }),
    'cruzadinha-respostas': cruz.svgCruzadinhaA4(escola, { titulo: 'Coisas da escola', gabarito: true }),
    'pauta-comum': p.svgPautaA4(),
    'pauta-ampliada': p.svgPautaA4(p.PAUTAS.ampliada),
    'pauta-muito-ampliada': p.svgPautaA4(p.PAUTAS.muitoAmpliada),
    'caligrafia': p.svgCaligrafiaA4(),
    'quadriculado-10mm': p.svgQuadriculadoA4(),
    'quadriculado-ampliado': p.svgQuadriculadoA4({ lado: 20, grossura: 0.8 }),
    'milimetrado': p.svgMilimetradoA4(),
    'pontilhado': p.svgPontilhadoA4(),
    'reguas': p.svgReguasA4(),
    'plano-cartesiano': p.svgPlanoCartesianoA4(),
    'parabola-respostas': p.svgPlanoCartesianoA4({ curva: { a: 1, b: -2, c: -3 }, respostas: true }),
    'calendario-figura': p.svgCalendarioA4({ ano: hoje.getFullYear(), mes: hoje.getMonth() + 1 }),
    'calendario-anotar': p.svgCalendarioA4({ ano: hoje.getFullYear(), mes: hoje.getMonth() + 1, modelo: 'anotar' }),
    'calendario-ano': p.svgCalendarioAnoA4(hoje.getFullYear() + 1),
    'memoria': j.svgMemoriaA4(pecas)[0].svg,
    'memoria-leitura': j.svgMemoriaA4(pecas, { par: 'leitura' })[0].svg,
    'memoria-verso': j.svgMemoriaA4(pecas, { verso: true }).at(-1).svg,
    'domino': j.svgDominoA4(pecas)[0].svg,
    'bingo-cartelas': j.svgBingoA4(pecas, { cartelas: 4 })[0].svg,
    'bingo-fichas': j.svgBingoA4(pecas, { cartelas: 4 }).at(-1).svg,
    'tabuleiro': j.svgTabuleiroA4({ titulo: 'Xadrez' }),
    'pecas-damas': j.svgPecasDamasA4(),
    'pecas-xadrez': j.svgPecasXadrezA4(),
    'relogios-ler': mat.svgRelogiosA4(horas)[0].svg,
    'relogios-marcar': mat.svgRelogiosA4(horas, { modo: 'marcar' })[0].svg,
    'relogio-de-montar': mat.svgRelogioDeMontarA4(),
    'reta-numerica': mat.svgRetasA4({ de: 0, ate: 20, semNumeroDesde: 3 }),
    'reta-negativos': mat.svgRetasA4({ de: -10, ate: 10 }),
  };
  for (const [nome, svg] of Object.entries(folhas)) writeFileSync(join(destino, `${nome}.svg`), svg);
  const figuras = Object.keys(folhas)
    .map((nome) => `<figure><img src="${nome}.svg" alt="${nome}"><figcaption>${nome}</figcaption></figure>`)
    .join('');
  writeFileSync(
    join(destino, 'amostra.html'),
    `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Geradores — amostra</title>
<style>body{margin:8px;font:14px sans-serif;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;background:#ccc}
figure{margin:0}img{width:100%;display:block;background:#fff}figcaption{text-align:center}</style>${figuras}</html>`,
  );
  console.log(`${Object.keys(folhas).length} folhas em ${destino}`);
} finally {
  await server.close();
}
