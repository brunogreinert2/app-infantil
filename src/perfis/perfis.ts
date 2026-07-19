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
