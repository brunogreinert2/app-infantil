import { describe, expect, it } from 'vitest';
import { conferirCopia, montarCopia, nomeDoArquivo } from './copia';

const DADOS = {
  perfis: [{ id: 1, nome: 'Theo', avatar: '🦖' }, { id: 2, nome: 'Davi', avatar: 'Ω' }],
  '1:colorir:lebre-e-tartaruga:il01': { regioes: { 'regiao-ceu': '#219ebc' }, tracos: [] },
  '2:tamanhoFonte': 23,
  '2:entrelinha': 'ampla',
};

describe('cópia de segurança', () => {
  it('o que sai é o que volta', () => {
    const texto = JSON.stringify(montarCopia(DADOS, new Date('2026-11-12T10:00:00Z')));
    const lida = conferirCopia(texto);
    expect(lida.ok).toBe(true);
    if (!lida.ok) return;
    expect(lida.copia.dados).toEqual(DADOS);
    expect(lida.perfis).toEqual(['Theo', 'Davi']);
    expect(lida.copia.feitaEm).toBe('2026-11-12T10:00:00.000Z');
  });

  it('recusa o que não é cópia do Historinhas', () => {
    for (const texto of ['', 'oi', '[]', 'null', '{"app":"outro","dados":{}}', '{"app":"historinhas"}', '{"app":"historinhas","versao":1,"dados":[]}']) {
      expect(conferirCopia(texto).ok, texto).toBe(false);
    }
  });

  it('recusa cópia de versão que este app ainda não conhece', () => {
    const r = conferirCopia('{"app":"historinhas","versao":99,"dados":{}}');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toContain('mais nova');
  });

  it('recusa chave estranha (o arquivo vem de fora)', () => {
    expect(conferirCopia('{"app":"historinhas","versao":1,"dados":{"a b<script>":1}}').ok).toBe(false);
    expect(conferirCopia('{"app":"historinhas","versao":1,"dados":{"":1}}').ok).toBe(false);
  });

  it('cópia sem perfis ainda é cópia (lista vazia)', () => {
    const r = conferirCopia('{"app":"historinhas","versao":1,"dados":{"1:tema":"espaco"}}');
    expect(r.ok && r.perfis).toEqual([]);
  });

  it('o arquivo leva a data no nome', () => {
    expect(nomeDoArquivo(new Date(2026, 10, 3))).toBe('historinhas-2026-11-03.json');
  });
});
