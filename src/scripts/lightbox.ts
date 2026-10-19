// Lightbox para fotos (links com data-foto dentro de um [data-galeria]) e vídeos do YouTube (links com data-video-modal).
// Sem JavaScript, os links abrem a foto ou o vídeo direto.
let dialogo: HTMLDialogElement | undefined;
let itens: HTMLAnchorElement[] = [];
let atual = 0;

function palco(): HTMLElement {
  return dialogo!.querySelector('[data-palco]')!;
}

function mostrar(indice: number) {
  atual = (indice + itens.length) % itens.length;
  const link = itens[atual];
  const id = link.dataset.videoModal;
  if (id) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
    iframe.title = link.dataset.titulo ?? 'Vídeo';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    palco().replaceChildren(iframe);
  } else {
    const img = document.createElement('img');
    img.src = link.href;
    img.alt = link.querySelector('img')?.alt ?? '';
    palco().replaceChildren(img);
  }
  dialogo!.querySelector('[data-contador]')!.textContent = itens.length > 1 ? `${atual + 1} de ${itens.length}` : '';
}

function criarDialogo() {
  dialogo = document.createElement('dialog');
  dialogo.className = 'lightbox';
  dialogo.innerHTML = `
    <div class="lightbox__palco" data-palco></div>
    <p data-contador></p>
    <button type="button" data-acao="anterior" aria-label="Anterior">‹</button>
    <button type="button" data-acao="proxima" aria-label="Próxima">›</button>
    <button type="button" data-acao="fechar" aria-label="Fechar">×</button>`;
  dialogo.addEventListener('click', (e) => {
    const alvo = e.target as HTMLElement;
    const acao = alvo.closest<HTMLElement>('[data-acao]')?.dataset.acao;
    if (acao === 'anterior') mostrar(atual - 1);
    else if (acao === 'proxima') mostrar(atual + 1);
    else if (acao === 'fechar' || alvo === dialogo || alvo.matches('[data-palco]')) dialogo!.close();
  });
  dialogo.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') mostrar(atual - 1);
    if (e.key === 'ArrowRight') mostrar(atual + 1);
  });
  // Para o vídeo ao fechar.
  dialogo.addEventListener('close', () => palco().replaceChildren());
  document.body.append(dialogo);
}

document.addEventListener('click', (e) => {
  const link = (e.target as Element).closest<HTMLAnchorElement>('a[data-foto], a[data-video-modal]');
  if (!link || e.metaKey || e.ctrlKey) return;
  e.preventDefault();
  if (!dialogo) criarDialogo();
  const grupo = link.closest('[data-galeria]');
  const seletor = link.matches('[data-foto]') ? 'a[data-foto]' : 'a[data-video-modal]';
  itens = grupo ? [...grupo.querySelectorAll<HTMLAnchorElement>(seletor)] : [link];
  dialogo!.showModal();
  mostrar(itens.indexOf(link));
});
