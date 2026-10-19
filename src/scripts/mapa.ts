import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { SedeCliente } from '../lib/sedes';
import { proximoTreino } from '../lib/proximo';

const pino = (destaque = false) =>
  L.divIcon({
    className: destaque ? 'pino pino--destaque' : 'pino',
    html: '<span></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 33],
    popupAnchor: [0, -26],
  });

function escapar(texto: string): string {
  const el = document.createElement('span');
  el.textContent = texto;
  return el.innerHTML;
}

function conteudoPopup(sede: SedeCliente): string {
  const proximo = proximoTreino(sede);
  return `
    <strong class="popup__nome">${escapar(sede.nome)}</strong>
    <span class="popup__local">${escapar(sede.local)}</span>
    <span class="popup__proximo">${proximo ? `Próximo treino: ${escapar(proximo)}` : 'Horários com o responsável'}</span>
    <a class="popup__link" href="/sedes/${sede.id}/">Ver horários e contato</a>`;
}

export interface MapaSedes {
  mapa: L.Map;
  focar(id: string): void;
  mostrar(ids: Set<string>): void;
  enquadrar(ids?: Set<string>, extra?: [number, number]): void;
  marcarUsuario(coordenadas: [number, number]): void;
}

export function criarMapa(el: HTMLElement, sedes: SedeCliente[], opcoes: { destaque?: string; zoom?: number } = {}): MapaSedes {
  const mapa = L.map(el, { scrollWheelZoom: false, zoomControl: true });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(mapa);

  // Só habilita o zoom pela rolagem depois que a pessoa interage, para não prender a rolagem da página.
  mapa.once('focus click', () => mapa.scrollWheelZoom.enable());

  const marcadores = new Map<string, L.Marker>();
  for (const sede of sedes) {
    const marcador = L.marker(sede.coordenadas, {
      icon: pino(sede.id === opcoes.destaque),
      title: sede.nome,
      alt: sede.nome,
      riseOnHover: true,
    })
      .bindPopup(() => conteudoPopup(sede))
      .addTo(mapa);
    marcadores.set(sede.id, marcador);
  }

  // Sem o filtro, a sede de São Paulo afasta o zoom e esconde as de Londrina.
  const noParana = sedes.filter((s) => s.regiao !== 'outros');

  function enquadrar(ids?: Set<string>, extra?: [number, number]) {
    const alvo = ids ? sedes.filter((s) => ids.has(s.id)) : noParana.length ? noParana : sedes;
    const pontos: [number, number][] = alvo.map((s) => s.coordenadas);
    if (extra) pontos.push(extra);
    if (!pontos.length) return;
    if (pontos.length === 1) mapa.setView(pontos[0], opcoes.zoom ?? 15);
    else mapa.fitBounds(L.latLngBounds(pontos), { padding: [32, 32], maxZoom: 15 });
  }

  enquadrar();

  let usuario: L.CircleMarker | undefined;

  return {
    mapa,
    enquadrar,
    focar(id) {
      const marcador = marcadores.get(id);
      if (!marcador) return;
      mapa.flyTo(marcador.getLatLng(), Math.max(mapa.getZoom(), 15), { duration: 0.6 });
      marcador.openPopup();
    },
    mostrar(ids) {
      for (const [id, marcador] of marcadores) {
        if (ids.has(id)) marcador.addTo(mapa);
        else marcador.remove();
      }
    },
    marcarUsuario(coordenadas) {
      usuario?.remove();
      usuario = L.circleMarker(coordenadas, {
        radius: 8,
        color: '#fff',
        weight: 3,
        fillColor: '#1a73e8',
        fillOpacity: 1,
      })
        .bindTooltip('Você está aqui')
        .addTo(mapa);
    },
  };
}
