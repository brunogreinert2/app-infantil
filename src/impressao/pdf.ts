// Um PDF mínimo, escrito à mão: cada página A4 é uma imagem JPEG centrada.
//
// Por que existe: no app instalado no iPhone não há "imprimir" (logo, não há
// "Salvar em PDF"). Com isto o próprio app monta o PDF e o entrega pelo
// compartilhar — de onde vai para o Drive, para Arquivos ou para a impressora.
//
// Não é uma biblioteca de PDF: sabe fazer só isto, em ~70 linhas, sem pesar
// no pacote (LEI 3). O JPEG entra como está (o PDF aceita JPEG cru, filtro
// DCTDecode), então não há compressão a implementar.
//
// É só conta: bytes para bytes. Testável sem navegador.

export interface PaginaJpeg {
  jpeg: Uint8Array;
  /** tamanho da imagem em pixels */
  largura: number;
  altura: number;
}

// A4 em pontos (1/72 de polegada) e a margem de cada lado
const A4_MENOR = 595.28;
const A4_MAIOR = 841.89;
const MARGEM = 28.35; // 10 mm

const n = (v: number) => String(+v.toFixed(2));

export function montarPdf(paginas: PaginaJpeg[], titulo = 'Historinhas'): Uint8Array {
  const codificar = new TextEncoder();
  const pedacos: Uint8Array[] = [];
  const inicios: number[] = []; // onde começa cada objeto (para a tabela do fim)
  let tamanho = 0;
  const por = (dado: string | Uint8Array) => {
    const bytes = typeof dado === 'string' ? codificar.encode(dado) : dado;
    pedacos.push(bytes);
    tamanho += bytes.length;
  };
  const objeto = (numero: number, corpo: string, fluxo?: Uint8Array) => {
    inicios[numero] = tamanho;
    por(`${numero} 0 obj\n${corpo}\n`);
    if (fluxo) {
      por('stream\n');
      por(fluxo);
      por('\nendstream\n');
    }
    por('endobj\n');
  };

  // 1 = catálogo, 2 = lista de páginas, 3 = informações;
  // depois, três objetos por página: página, desenho e imagem
  const numeroDaPagina = (i: number) => 4 + i * 3;
  por('%PDF-1.4\n%âãÏÓ\n');
  objeto(1, '<< /Type /Catalog /Pages 2 0 R >>');
  objeto(
    2,
    `<< /Type /Pages /Count ${paginas.length} /Kids [${paginas.map((_, i) => `${numeroDaPagina(i)} 0 R`).join(' ')}] >>`,
  );
  // só letras simples no título: texto de PDF fora do ASCII pede outra codificação
  const tituloSimples = titulo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\x20-\x7e]/g, '')
    .replace(/[\\()]/g, '');
  objeto(3, `<< /Title (${tituloSimples}) /Producer (Historinhas) >>`);

  paginas.forEach((p, i) => {
    const deitada = p.largura > p.altura;
    const larguraFolha = deitada ? A4_MAIOR : A4_MENOR;
    const alturaFolha = deitada ? A4_MENOR : A4_MAIOR;
    // a imagem cabe inteira dentro das margens, sem deformar, e fica no meio
    const escala = Math.min((larguraFolha - 2 * MARGEM) / p.largura, (alturaFolha - 2 * MARGEM) / p.altura);
    const w = p.largura * escala;
    const h = p.altura * escala;
    const x = (larguraFolha - w) / 2;
    const y = (alturaFolha - h) / 2;
    const base = numeroDaPagina(i);
    objeto(
      base,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${n(larguraFolha)} ${n(alturaFolha)}] ` +
        `/Resources << /XObject << /Im0 ${base + 2} 0 R >> >> /Contents ${base + 1} 0 R >>`,
    );
    const desenho = codificar.encode(`q ${n(w)} 0 0 ${n(h)} ${n(x)} ${n(y)} cm /Im0 Do Q`);
    objeto(base + 1, `<< /Length ${desenho.length} >>`, desenho);
    objeto(
      base + 2,
      `<< /Type /XObject /Subtype /Image /Width ${p.largura} /Height ${p.altura} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.jpeg.length} >>`,
      p.jpeg,
    );
  });

  const total = 3 + paginas.length * 3;
  const tabela = tamanho;
  por(`xref\n0 ${total + 1}\n0000000000 65535 f \n`);
  for (let k = 1; k <= total; k++) por(`${String(inicios[k]).padStart(10, '0')} 00000 n \n`);
  por(`trailer\n<< /Size ${total + 1} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${tabela}\n%%EOF\n`);

  const saida = new Uint8Array(tamanho);
  let onde = 0;
  for (const pedaco of pedacos) {
    saida.set(pedaco, onde);
    onde += pedaco.length;
  }
  return saida;
}
