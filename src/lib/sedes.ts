import { getCollection, type CollectionEntry } from 'astro:content';
import { distanciaKm } from './distancia';

export { distanciaKm };

export type Sede = CollectionEntry<'sedes'>;
export type Horario = Sede['data']['horarios'][number];
export type Dia = Horario['dias'][number];

export const DIAS: { id: Dia; curto: string; longo: string }[] = [
  { id: 'seg', curto: 'Seg', longo: 'Segunda' },
  { id: 'ter', curto: 'Ter', longo: 'Terça' },
  { id: 'qua', curto: 'Qua', longo: 'Quarta' },
  { id: 'qui', curto: 'Qui', longo: 'Quinta' },
  { id: 'sex', curto: 'Sex', longo: 'Sexta' },
  { id: 'sab', curto: 'Sáb', longo: 'Sábado' },
  { id: 'dom', curto: 'Dom', longo: 'Domingo' },
];

export const CIDADE_SEDE = 'Londrina';

/** Londrina primeiro, depois as cidades da região e por fim fora do Paraná. */
export async function getSedes(): Promise<Sede[]> {
  const sedes = await getCollection('sedes');
  const peso = (s: Sede) => (s.data.cidade === CIDADE_SEDE ? 0 : s.data.uf === 'PR' ? 1 : 2);
  return sedes.sort(
    (a, b) =>
      peso(a) - peso(b) ||
      a.data.cidade.localeCompare(b.data.cidade, 'pt-BR') ||
      a.data.nome.localeCompare(b.data.nome, 'pt-BR'),
  );
}

export function regiao(s: Sede): 'londrina' | 'regiao' | 'outros' {
  if (s.data.cidade === CIDADE_SEDE) return 'londrina';
  return s.data.uf === 'PR' ? 'regiao' : 'outros';
}

export function local(s: Sede): string {
  const cidade = s.data.uf === 'PR' ? s.data.cidade : `${s.data.cidade}, ${s.data.uf}`;
  return s.data.bairro ? `${s.data.bairro}, ${cidade}` : cidade;
}

/** "19:30" → "19h30", "06:00" → "6h" */
export function hora(h: string): string {
  const [hh, mm] = h.split(':');
  return `${Number(hh)}h${mm === '00' ? '' : mm}`;
}

/** Aulas de um dia, em ordem de horário. */
export function aulasDoDia(s: Sede, dia: Dia): Horario[] {
  return s.data.horarios.filter((h) => h.dias.includes(dia)).sort((a, b) => a.inicio.localeCompare(b.inicio));
}

export function digitos(telefone: string): string {
  return telefone.replace(/\D/g, '');
}

/** Celular brasileiro: DDD + 9 dígitos começando com 9. */
export function ehCelular(telefone: string): boolean {
  const d = digitos(telefone).replace(/^55/, '');
  return d.length === 11 && d[2] === '9';
}

export function linkTelefone(telefone: string): string {
  return `tel:+55${digitos(telefone).replace(/^55/, '')}`;
}

export function linkWhatsApp(telefone: string, sede: string): string {
  const texto = encodeURIComponent(`Olá! Vi no site da HJJT e quero saber sobre os treinos na ${sede}.`);
  return `https://wa.me/55${digitos(telefone).replace(/^55/, '')}?text=${texto}`;
}

export function linkInstagram(usuario: string): string {
  return `https://www.instagram.com/${usuario}/`;
}

export function linkRota([lat, lng]: [number, number]): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function maisProximas(sede: Sede, todas: Sede[], quantas = 3): Sede[] {
  return todas
    .filter((s) => s.id !== sede.id)
    .sort((a, b) => distanciaKm(sede.data.coordenadas, a.data.coordenadas) - distanciaKm(sede.data.coordenadas, b.data.coordenadas))
    .slice(0, quantas);
}

/** Dados mínimos que os scripts do navegador precisam (mapa, próximo treino, perto de mim). */
export function paraCliente(s: Sede) {
  return {
    id: s.id,
    nome: s.data.nome,
    local: local(s),
    regiao: regiao(s),
    coordenadas: s.data.coordenadas,
    horarios: s.data.horarios.map(({ dias, inicio, turma }) => ({ dias, inicio, turma })),
  };
}
export type SedeCliente = ReturnType<typeof paraCliente>;

/** schema.org para o Google entender cada sede como um local de treino da equipe. */
export function jsonLdSede(s: Sede, url: string) {
  const { data } = s;
  const resumoHorarios = DIAS.flatMap((d) => {
    const aulas = aulasDoDia(s, d.id);
    return aulas.length ? [`${d.longo}: ${aulas.map((a) => hora(a.inicio) + (a.turma ? ` (${a.turma})` : '')).join(', ')}`] : [];
  }).join('. ');
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    '@id': `${url}#local`,
    name: `HJJT – ${data.nome}`,
    url,
    description: `Aulas de jiu-jitsu da HJJT (Horse Jiu-Jitsu Team) em ${local(s)}.${resumoHorarios ? ` ${resumoHorarios}.` : ''}`,
    address: {
      '@type': 'PostalAddress',
      ...(data.endereco && { streetAddress: data.endereco }),
      addressLocality: data.cidade,
      addressRegion: data.uf,
      addressCountry: 'BR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: data.coordenadas[0], longitude: data.coordenadas[1] },
    hasMap: linkRota(data.coordenadas),
    ...(data.telefone && { telephone: `+55 ${data.telefone}` }),
    ...(data.instagram && { sameAs: [linkInstagram(data.instagram)] }),
    parentOrganization: { '@id': 'https://equipehjjt.com.br/#equipe' },
  };
}
