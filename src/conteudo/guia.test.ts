import { describe, expect, it } from 'vitest';
import { GUIA } from './guia';

const tudo = GUIA.flatMap((s) => [s.titulo, ...s.paragrafos]).join(' ');

describe('guia de quem ensina', () => {
  it('toda seção tem título único e pelo menos um parágrafo de verdade', () => {
    expect(new Set(GUIA.map((s) => s.titulo)).size).toBe(GUIA.length);
    for (const s of GUIA) {
      expect(s.paragrafos.length, s.titulo).toBeGreaterThan(0);
      for (const p of s.paragrafos) expect(p.trim().length, s.titulo).toBeGreaterThan(20);
    }
  });

  it('fala de cada recurso de acesso que o app tem', () => {
    for (const assunto of [
      'Espaço entre as linhas', 'Espaço entre as letras', 'Peso da letra', 'Alto contraste',
      'OpenDyslexic', 'Régua', 'daltonismo', 'Escolha uma parte e pinte', 'cópia de segurança',
    ]) {
      expect(tudo, assunto).toContain(assunto);
    }
  });

  // o guia não pode prometer o que ninguém mediu
  it('diz o que não foi testado, e não fala em cura nem em diagnóstico', () => {
    expect(tudo).toContain('ainda não foi avaliado');
    expect(tudo).toContain('Não foi testado com leitor de tela');
    expect(tudo).toContain('não substitui avaliação');
    expect(tudo).not.toMatch(/\bcura\b|\btrata\b|comprovad|garant/i);
  });
});
