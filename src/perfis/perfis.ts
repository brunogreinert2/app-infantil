// Perfis por criança num único aparelho (ESPECIFICACAO.md 8.5/8.6).
// O app SEMPRE abre na seleção de perfil; o perfil ativo vive só em memória.

import { armazenamento } from '../armazenamento/armazenamento';

export interface Perfil {
  id: number;
  nome: string;
  avatar: string;      // emoji/letra grande — seleção puramente visual
  faixaEtaria: string; // casa com faixa_etaria do front matter
}

const SEMENTE: Perfil[] = [
  { id: 1, nome: 'Theo', avatar: '🦖', faixaEtaria: '6-8' },
  { id: 2, nome: 'Davi', avatar: 'Ω', faixaEtaria: '9-11' },
];

let ativo: Perfil | null = null;

export async function listarPerfis(): Promise<Perfil[]> {
  const salvos = await armazenamento.obter<Perfil[]>('perfis');
  if (salvos && salvos.length > 0) return salvos;
  await armazenamento.definir('perfis', SEMENTE);
  return SEMENTE;
}

export function definirPerfilAtivo(p: Perfil): void {
  ativo = p;
}

export function perfilAtivo(): Perfil {
  if (!ativo) throw new Error('Nenhum perfil ativo — a tela de perfis deve vir primeiro');
  return ativo;
}

export function temPerfilAtivo(): boolean {
  return ativo !== null;
}

// ---------- gestão de perfis (tela de ajustes, atrás da trava parental) ----------

export const AVATARES = [
  '🦖', 'Ω', 'π', '🦉', '🚀', '🐢', '🦄', '⚽',
  '🎨', '🐱', '🐶', '🌟', '🍉', '🤖', '🧸', '🎸',
];

export const FAIXAS = ['4-6', '6-8', '9-11', '12+'];

export async function criarPerfil(nome: string, avatar: string, faixaEtaria: string): Promise<Perfil> {
  const lista = await listarPerfis();
  const novo: Perfil = {
    id: Math.max(0, ...lista.map((p) => p.id)) + 1,
    nome,
    avatar,
    faixaEtaria,
  };
  await armazenamento.definir('perfis', [...lista, novo]);
  return novo;
}

export async function atualizarPerfil(perfil: Perfil): Promise<void> {
  const lista = await listarPerfis();
  await armazenamento.definir(
    'perfis',
    lista.map((p) => (p.id === perfil.id ? perfil : p)),
  );
  if (ativo?.id === perfil.id) ativo = perfil;
}

// Exclui o perfil E todos os dados dele (progresso, quiz, colorir, conquistas).
export async function excluirPerfil(id: number): Promise<void> {
  const lista = await listarPerfis();
  await armazenamento.definir('perfis', lista.filter((p) => p.id !== id));
  for (const chave of await armazenamento.chaves(`${id}:`)) {
    await armazenamento.remover(chave);
  }
  if (ativo?.id === id) ativo = null;
}
