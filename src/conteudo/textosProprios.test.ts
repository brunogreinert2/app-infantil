import { describe, expect, it } from 'vitest';
import {
  combina,
  deAnotacaoAntiga,
  deArquivo,
  juntar,
  lerJsonDeTextos,
  paraPedraAngular,
  type TextoProprio,
} from './textosProprios';

const AGORA = Date.UTC(2026, 10, 12);

const texto = (id: string, titulo: string, conteudo: string, tipo: TextoProprio['tipo'] = 'md'): TextoProprio => ({
  id, titulo, autor: '', tipo, conteudo, fonte: 'padrao', quebrar: true, criadoEm: AGORA, alteradoEm: AGORA,
});

// um backup de verdade do Pedra Angular tem este feitio (src/lib/backup.ts de lá)
const BACKUP_PA = JSON.stringify({
  app: 'pedra-angular-leitura',
  version: 1,
  exportedAt: '2026-11-10T12:00:00.000Z',
  localStorage: { 'app-tema': 'sepia', 'app-espacamento': 'amplo' },
  files: [
    { id: 'local-apologia', nome: 'Apologia.md', titulo: 'Apologia', autor: 'Platão', tipo: 'md', conteudo: '# Apologia\n\nCidadãos de Atenas…', criadoEm: 1 },
    { id: 'texto-abc', nome: 'Comandos.txt', titulo: 'Comandos', autor: 'Texto próprio', tipo: 'txt', conteudo: '/gamerule randomTickSpeed 3', criadoEm: 2 },
  ],
});

describe('textos próprios: troca com o Pedra Angular', () => {
  it('lê um backup do Pedra Angular e fica só com os textos', () => {
    const r = lerJsonDeTextos(BACKUP_PA, AGORA);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.doPedraAngular).toBe(true);
    expect(r.textos.map((t) => [t.id, t.titulo, t.autor, t.tipo])).toEqual([
      ['local-apologia', 'Apologia', 'Platão', 'md'],
      ['texto-abc', 'Comandos', '', 'txt'], // "Texto próprio" é carimbo, não autor
    ]);
  });

  it('o que sai daqui o Pedra Angular aceita: marca, versão, localStorage e campos de cada arquivo', () => {
    const json = paraPedraAngular([texto('nota-1', '', '/give @p diamond 64\n# comentário', 'nota')], new Date(AGORA));
    // o mesmo teste que o importBackup do Pedra Angular faz
    expect(json.app).toBe('pedra-angular-leitura');
    expect(typeof json.localStorage).toBe('object');
    expect(Object.keys(json.localStorage)).toHaveLength(0); // não mexe no tema de lá
    const [f] = json.files;
    expect(f).toMatchObject({ id: 'nota-1', tipo: 'txt', titulo: '/give @p diamond 64', autor: 'Historinhas' });
    expect(f.nome).toMatch(/\.txt$/); // lá o tipo sai da extensão do nome
    expect(f.conteudo).toBe('/give @p diamond 64\n# comentário');
  });

  it('nota vai como .txt (o # do comando não vira título); md vai como .md', () => {
    const json = paraPedraAngular([texto('a', 'A', 'x', 'nota'), texto('b', 'B', 'y', 'md'), texto('c', 'C', 'z', 'txt')], new Date(AGORA));
    expect(json.files.map((f) => f.tipo)).toEqual(['txt', 'md', 'txt']);
  });

  it('ida e volta: exportar daqui e importar daqui devolve os mesmos textos', () => {
    const origem = [texto('texto-1', 'O Pequeno Príncipe', '# Capítulo 1\n\nQuando eu tinha seis anos…'), texto('nota-2', 'Comandos', '/tp @s 0 64 0', 'nota')];
    const r = lerJsonDeTextos(JSON.stringify(paraPedraAngular(origem, new Date(AGORA))), AGORA);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.doPedraAngular).toBe(false);
    expect(r.textos.map((t) => [t.id, t.titulo, t.conteudo])).toEqual(origem.map((t) => [t.id, t.titulo, t.conteudo]));
  });

  it('recusa o que não é, e diz onde se traz a cópia do Historinhas inteiro', () => {
    expect(lerJsonDeTextos('oi', AGORA).ok).toBe(false);
    expect(lerJsonDeTextos('{"app":"outro","files":[]}', AGORA).ok).toBe(false);
    const r = lerJsonDeTextos('{"app":"historinhas","versao":2,"dados":{}}', AGORA);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toContain('Ajustes');
  });

  it('id estranho de fora é trocado por um novo', () => {
    const r = lerJsonDeTextos(JSON.stringify({ app: 'pedra-angular-leitura', files: [{ id: 'a b<x>', conteudo: 'oi' }] }), AGORA);
    expect(r.ok && r.textos[0].id).toMatch(/^texto-/);
  });
});

describe('textos próprios: arquivos .md e .txt', () => {
  it('título e autor do front matter; senão, o nome do arquivo', () => {
    const md = deArquivo('livro.md', '---\ntitle: "[[Fédon]]"\nauthor: Platão\n---\n\n# Fédon', AGORA)!;
    expect([md.titulo, md.autor, md.tipo]).toEqual(['Fédon', 'Platão', 'md']);
    const txt = deArquivo('Minhas ideias.txt', '# isto não é título', AGORA)!;
    expect([txt.titulo, txt.autor, txt.tipo]).toEqual(['Minhas ideias', '', 'txt']);
  });

  it('outros arquivos são recusados', () => {
    expect(deArquivo('foto.png', 'x', AGORA)).toBeNull();
  });

  it('as anotações de antes viram textos do tipo nota, sem perder nada', () => {
    const t = deAnotacaoAntiga({ id: 7, titulo: '', texto: '/gamerule x', fonte: 'codigo', quebrar: false, alteradoEm: 5 });
    expect(t).toMatchObject({ id: 'nota-7', tipo: 'nota', conteudo: '/gamerule x', fonte: 'codigo', quebrar: false, alteradoEm: 5 });
  });
});

describe('textos próprios: juntar sem apagar', () => {
  const aqui = [texto('t1', 'Fédon', 'versão editada aqui')];

  it('mesmo id e mesmo texto: já está aqui', () => {
    expect(juntar(aqui, [texto('t1', 'Fédon', 'versão editada aqui')], AGORA)).toMatchObject({ novos: [], iguais: 1 });
  });

  it('mesmo id e texto diferente: entra ao lado, nunca por cima', () => {
    const { novos } = juntar(aqui, [texto('t1', 'Fédon', 'versão antiga')], AGORA);
    expect(novos).toHaveLength(1);
    expect(novos[0].id).not.toBe('t1');
    expect(novos[0].titulo).toBe('Fédon (cópia)');
  });

  it('id novo: entra como veio', () => {
    expect(juntar(aqui, [texto('t2', 'Críton', 'x')], AGORA).novos.map((t) => t.id)).toEqual(['t2']);
  });
});

describe('pesquisar', () => {
  it('sem acento, sem maiúscula, todas as palavras', () => {
    expect(combina('historia lebre', 'A História da Lebre')).toBe(true);
    expect(combina('platao', 'Fédon', 'Platão')).toBe(true);
    expect(combina('platao socrates', 'Fédon', 'Platão')).toBe(false);
    expect(combina('', 'qualquer')).toBe(true);
  });
});
