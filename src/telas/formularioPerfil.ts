// Formulário de perfil — nome, avatar e faixa etária.
//
// Vive em módulo próprio porque tem DOIS chamadores, e eles são bem
// diferentes: os ajustes (atrás da trava parental, criando e editando) e a
// porta de entrada do app, onde quem chega pela primeira vez cria o primeiro
// leitor. Um formulário só; duas cópias divergiriam na primeira mudança.

import { AVATARES, FAIXAS, type Perfil } from '../perfis/perfis';
import { el } from './comum';

export function formularioPerfil(
  existente: Perfil | null,
  aoSalvar: (nome: string, avatar: string, faixa: string) => void,
  aoCancelar: () => void,
): HTMLElement {
  const form = el('div', 'form-perfil');

  const nome = el('input', 'campo-nome') as HTMLInputElement;
  nome.placeholder = 'Nome ou apelido';
  nome.maxLength = 20;
  nome.value = existente?.nome ?? '';
  form.appendChild(nome);

  let avatarEscolhido = existente?.avatar ?? AVATARES[0];
  const grade = el('div', 'grade-avatares');
  for (const av of AVATARES) {
    const botao = el('button', 'poco-avatar', av);
    if (av === avatarEscolhido) botao.classList.add('ativa');
    botao.addEventListener('click', () => {
      avatarEscolhido = av;
      grade.querySelectorAll('.poco-avatar').forEach((x) => x.classList.remove('ativa'));
      botao.classList.add('ativa');
    });
    grade.appendChild(botao);
  }
  form.appendChild(grade);

  const faixa = el('select', 'campo-faixa') as HTMLSelectElement;
  for (const f of FAIXAS) {
    const opcao = document.createElement('option');
    opcao.value = f;
    opcao.textContent = `${f} anos`;
    if (f === (existente?.faixaEtaria ?? '6-8')) opcao.selected = true;
    faixa.appendChild(opcao);
  }
  form.appendChild(faixa);

  const linha = el('div', 'botoes-imagem');
  const salvar = el('button', 'botao-grande', 'Salvar');
  salvar.addEventListener('click', () => {
    const n = nome.value.trim();
    if (n) aoSalvar(n, avatarEscolhido, faixa.value);
  });
  const cancelar = el('button', 'botao-extra', 'Cancelar');
  cancelar.addEventListener('click', aoCancelar);
  linha.append(salvar, cancelar);
  form.appendChild(linha);

  return form;
}
