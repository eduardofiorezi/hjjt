import type { ImageMetadata } from 'astro';
import { albuns } from '../data/site';

const arquivos = import.meta.glob<{ default: ImageMetadata }>('../assets/fotos/*/*.{jpg,jpeg,png,webp}', { eager: true });

export interface Album {
  pasta: string;
  titulo: string;
  fotos: ImageMetadata[];
}

/** Agrupa as fotos por pasta, na ordem definida em data/site.ts, com os arquivos em ordem numérica. */
export function getAlbuns(): Album[] {
  const porPasta = new Map<string, { nome: string; imagem: ImageMetadata }[]>();
  for (const [caminho, modulo] of Object.entries(arquivos)) {
    const [pasta, nome] = caminho.split('/').slice(-2);
    if (pasta === 'destaque') continue; // fotos só do banner da home
    porPasta.set(pasta, [...(porPasta.get(pasta) ?? []), { nome, imagem: modulo.default }]);
  }
  const ordem = [...Object.keys(albuns), ...[...porPasta.keys()].filter((p) => !(p in albuns)).sort()];
  return ordem
    .filter((pasta) => porPasta.has(pasta))
    .map((pasta) => ({
      pasta,
      titulo: albuns[pasta] ?? pasta,
      fotos: porPasta
        .get(pasta)!
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }))
        .map((f) => f.imagem),
    }));
}
