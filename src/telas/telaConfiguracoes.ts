// Tela de ajustes — SEMPRE atrás da trava parental (spec 8.5/8.6:
// a trava vale para configurações e exclusão de dados, NUNCA para
// troca de perfil no dia a dia).
// v1: gestão de perfis (criar/editar/excluir) + sobre o app.

import {
  atualizarPerfil,
  criarPerfil,
  excluirPerfil,
  listarPerfis,
  type Perfil,
} from '../perfis/perfis';
import { el } from './comum';
import { formularioPerfil } from './formularioPerfil';

// Desafio de multiplicação: uma criança de 7 anos não resolve de cabeça
// na hora, um adulto sim. Proporcional ao risco (spec 8.5).
export function montarTravaParental(
  raiz: HTMLElement,
  aoPassar: () => void,
  aoCancelar: () => void,
): void {
  raiz.innerHTML = '';
  raiz.className = 'tela tela-trava';

  const a = 6 + Math.floor(Math.random() * 4); // 6..9
  const b = 6 + Math.floor(Math.random() * 4);

  const caixa = el('div', 'caixa-trava');
  caixa.appendChild(el('h2', undefined, '🔒 Área dos adultos'));
  caixa.appendChild(el('p', undefined, `Quanto é ${a} × ${b}?`));

  const campo = el('input', 'campo-trava') as HTMLInputElement;
  campo.type = 'number';
  campo.inputMode = 'numeric';
  campo.setAttribute('aria-label', 'Resposta');
  caixa.appendChild(campo);

  const aviso = el('p', 'aviso-trava', '');
  caixa.appendChild(aviso);

  const linha = el('div', 'botoes-imagem');
  const entrar = el('button', 'botao-grande', 'Entrar');
  const conferir = () => {
    if (Number(campo.value) === a * b) aoPassar();
    else {
      aviso.textContent = 'Hmm, não foi dessa vez. Tente de novo!';
      campo.value = '';
      campo.focus();
    }
  };
  entrar.addEventListener('click', conferir);
  campo.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') conferir();
  });
  const voltar = el('button', 'botao-extra', 'Voltar');
  voltar.addEventListener('click', aoCancelar);
  linha.append(entrar, voltar);
  caixa.appendChild(linha);

  raiz.appendChild(caixa);
  campo.focus();
}

export async function montarTelaConfiguracoes(
  raiz: HTMLElement,
  nav: { perfis: () => void },
): Promise<void> {
  raiz.innerHTML = '';
  raiz.className = 'tela tela-config';

  const barra = el('header', 'barra-topo');
  const voltar = el('button', 'botao-icone', '←');
  voltar.setAttribute('aria-label', 'Voltar');
  voltar.addEventListener('click', nav.perfis);
  barra.appendChild(voltar);
  barra.appendChild(el('h1', 'titulo-barra', '⚙️ Ajustes'));
  raiz.appendChild(barra);

  const corpo = el('div', 'corpo-config');
  raiz.appendChild(corpo);

  const recarregar = () => montarTelaConfiguracoes(raiz, nav);

  // ---------- perfis ----------
  corpo.appendChild(el('h2', 'titulo-secao', 'Perfis'));
  const lista = await listarPerfis();

  for (const p of lista) {
    corpo.appendChild(linhaPerfil(p, lista.length, recarregar));
  }

  const novo = el('button', 'botao-grande', '+ Novo perfil');
  novo.addEventListener('click', () => {
    novo.replaceWith(
      formularioPerfil(null, async (nome, avatar, faixa) => {
        await criarPerfil(nome, avatar, faixa);
        recarregar();
      }, recarregar),
    );
  });
  corpo.appendChild(novo);

  // ---------- sobre ----------
  corpo.appendChild(el('h2', 'titulo-secao', 'Sobre'));
  corpo.appendChild(
    el('p', 'texto-sobre', 'Historinhas — historinhas.app.br — v0.2.0. App de leitura, pintura e quizzes feito em família. Conteúdo em domínio público com tradução própria.'),
  );
  corpo.appendChild(
    el('p', 'texto-sobre', 'Atualizar o app NUNCA apaga as pinturas, insígnias e progresso — eles ficam guardados neste aparelho.'),
  );

  // PWA guarda tudo em cache pra funcionar offline; este botão força a
  // busca de versão nova (lição aprendida no pedraangular.app.br)
  const atualizar = el('button', 'botao-grande', '🔄 Procurar atualização');
  atualizar.addEventListener('click', async () => {
    atualizar.disabled = true;
    atualizar.textContent = '🔄 Procurando...';
    try {
      if ('serviceWorker' in navigator) {
        const registros = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registros.map((r) => r.update()));
      }
    } finally {
      setTimeout(() => window.location.reload(), 800);
    }
  });
  corpo.appendChild(atualizar);
}

function linhaPerfil(p: Perfil, totalPerfis: number, recarregar: () => void): HTMLElement {
  const linha = el('div', 'linha-perfil');
  linha.appendChild(el('span', 'avatar-linha', p.avatar));
  linha.appendChild(el('span', 'nome-linha', `${p.nome} (${p.faixaEtaria})`));

  const editar = el('button', 'botao-icone', '✏️');
  editar.setAttribute('aria-label', `Editar ${p.nome}`);
  editar.addEventListener('click', () => {
    linha.replaceWith(
      formularioPerfil(p, async (nome, avatar, faixa) => {
        await atualizarPerfil({ ...p, nome, avatar, faixaEtaria: faixa });
        recarregar();
      }, recarregar),
    );
  });
  linha.appendChild(editar);

  // exclusão em dois toques (sem diálogo bloqueante), some se for o último perfil
  if (totalPerfis > 1) {
    const excluir = el('button', 'botao-icone botao-perigo', '🗑️');
    excluir.setAttribute('aria-label', `Excluir ${p.nome}`);
    let armado = false;
    excluir.addEventListener('click', async () => {
      if (!armado) {
        armado = true;
        excluir.textContent = 'Excluir tudo?';
        setTimeout(() => {
          armado = false;
          excluir.textContent = '🗑️';
        }, 4000);
        return;
      }
      await excluirPerfil(p.id);
      recarregar();
    });
    linha.appendChild(excluir);
  }
  return linha;
}

