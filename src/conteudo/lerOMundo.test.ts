import { describe, it, expect } from 'vitest';
import {
  CATALOGO,
  TODAS_AS_PALAVRAS,
  fichaDePalavraPropria,
  gerarCadernoLerOMundo,
  idDaPalavra,
  parecidasDe,
} from './lerOMundo';
import { svgPalavraA4 } from './lerOMundoArte';
import { PICTOGRAMAS, PRANCHA_ESSENCIAL, gerarCadernoComunicacao, svgPranchaA4 } from './pranchaCaa';
import { gerarCadernoAlfabeto } from './alfabetos';

const folhas = () => [...gerarCadernoLerOMundo(), ...gerarCadernoComunicacao()];

describe('Ler o Mundo: letramento para jovens e adultos', () => {
  it('separa as sílabas de modo que as partes formem a palavra', () => {
    for (const p of TODAS_AS_PALAVRAS) {
      expect(p.silabas?.join('')).toBe(p.palavra);
      expect(p.palavra).toBe(p.palavra.toLocaleUpperCase('pt-BR'));
    }
  });

  it('oferece quatro parecidas diferentes do alvo, sem repetição', () => {
    for (const p of TODAS_AS_PALAVRAS) {
      const outras = parecidasDe(p);
      expect(outras).toHaveLength(4);
      expect(new Set(outras).size).toBe(4);
      expect(outras).not.toContain(p.palavra);
    }
  });

  it('não repete palavra nem id no catálogo', () => {
    const ids = TODAS_AS_PALAVRAS.map((p) => idDaPalavra(p.palavra));
    expect(new Set(ids).size).toBe(ids.length);
    expect(idDaPalavra('SAÍDA')).toBe('saida');
    expect(CATALOGO.map((g) => g.id)).toContain('transporte');
  });

  it('gera folhas A4 sem IDs repetidos, fontes externas ou scripts', () => {
    const todas = folhas();
    expect(new Set(todas.map((f) => f.id)).size).toBe(todas.length);
    for (const f of todas) {
      expect(f.svg).toContain('viewBox="0 0 800 1131"');
      expect(f.svg).toContain('data-folha-a4="true"');
      const ids = [...f.svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
      expect(new Set(ids).size, f.id).toBe(ids.length);
      expect(f.svg).not.toMatch(/<(script|image|text)\b/);
      expect(f.svg).not.toMatch(/(?:href|src)="https?:/);
      expect(f.svg).toContain('class="colorir-alvo" fill="#ffffff"');
      expect(f.svg).not.toContain('undefined');
      expect(f.svg).not.toContain('NaN');
    }
  });

  it('não leva a marca infantil nem manda pintar', () => {
    for (const f of folhas()) {
      const legendas = [...f.svg.matchAll(/aria-label="([^"]*)"/g)].map((m) => m[1]).join(' | ');
      expect(legendas).not.toMatch(/historinhas/i);
      expect(legendas).not.toMatch(/\bpint[ea]/i);
      expect(legendas).not.toMatch(/professora|criança/i);
      expect(f.svg).not.toMatch(/Historinhas/);
    }
  });

  it('não muda as folhas infantis: a marca Historinhas continua nelas', () => {
    const letra = gerarCadernoAlfabeto('alfabeto')[0].svg;
    expect(letra).toContain('aria-label="HISTORINHAS"');
    expect(letra).toContain('aria-label="historinhas.app.br"');
  });

  it('faz a ficha de uma palavra da professora, com ou sem sílabas', () => {
    const semSilabas = fichaDePalavraPropria({ palavra: ' restinga ', contexto: 'letreiro' });
    expect(semSilabas.palavra).toBe('RESTINGA');
    expect(svgPalavraA4(semSilabas)).toContain('letra por letra');
    expect(parecidasDe(semSilabas)).toHaveLength(4);
    const comSilabas = fichaDePalavraPropria({ palavra: 'Vitória', silabas: ['vi', 'tó', 'ria'] });
    expect(svgPalavraA4(comSilabas)).toContain('A palavra em 3 partes');
    expect(() => fichaDePalavraPropria({ palavra: 'linha 10' })).toThrow();
    expect(() => fichaDePalavraPropria({ palavra: 'Vitória', silabas: ['vi', 'to', 'ria'] })).toThrow();
  });
});

describe('prancha de comunicação (CAA)', () => {
  it('tem vinte casas, cada uma com palavra, fala e desenho existente', () => {
    expect(PRANCHA_ESSENCIAL.casas).toHaveLength(20);
    for (const casa of PRANCHA_ESSENCIAL.casas) {
      expect(casa.rotulo).not.toBe('');
      expect(casa.fala).not.toBe('');
      expect(casa.pictograma === 'pergunta' || Boolean(PICTOGRAMAS[casa.pictograma!])).toBe(true);
    }
  });
  it('escreve a palavra em toda casa: o desenho nunca vai sozinho', () => {
    const svg = svgPranchaA4(PRANCHA_ESSENCIAL);
    for (const casa of PRANCHA_ESSENCIAL.casas) {
      expect(svg).toContain(`aria-label="${casa.rotulo}"`);
      expect(svg).toContain(`id="regiao-casa-${casa.id}"`);
    }
  });
});
