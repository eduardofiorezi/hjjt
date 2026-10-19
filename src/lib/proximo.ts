// Roda no navegador: o site é estático, então "agora" só existe no cliente.
import type { SedeCliente } from './sedes';

const ORDEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'] as const;
const NOMES: Record<string, string> = {
  dom: 'domingo',
  seg: 'segunda',
  ter: 'terça',
  qua: 'quarta',
  qui: 'quinta',
  sex: 'sexta',
  sab: 'sábado',
};

/** Dia da semana e minutos desde 0h no horário de Brasília. */
export function agoraEmBrasilia(data = new Date()): { dia: (typeof ORDEM)[number]; minutos: number } {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(data);
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? '';
  const dia = ORDEM[['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(valor('weekday'))];
  return { dia, minutos: Number(valor('hour')) * 60 + Number(valor('minute')) };
}

export function diaDeHoje(): (typeof ORDEM)[number] {
  return agoraEmBrasilia().dia;
}

function formatarHora(h: string): string {
  const [hh, mm] = h.split(':');
  return `${Number(hh)}h${mm === '00' ? '' : mm}`;
}

/** "hoje às 19h30", "amanhã às 6h", "quinta às 20h"; null se a sede não tem horários cadastrados. */
export function proximoTreino(sede: SedeCliente, data = new Date()): string | null {
  if (!sede.horarios.length) return null;
  const { dia, minutos } = agoraEmBrasilia(data);
  const hoje = ORDEM.indexOf(dia);

  for (let adiante = 0; adiante < 8; adiante++) {
    const d = ORDEM[(hoje + adiante) % 7];
    const aulas = sede.horarios
      .filter((h) => (h.dias as string[]).includes(d))
      .filter((h) => {
        if (adiante > 0) return true;
        const [hh, mm] = h.inicio.split(':').map(Number);
        return hh * 60 + mm > minutos;
      })
      .sort((a, b) => a.inicio.localeCompare(b.inicio));
    if (aulas.length) {
      const aula = aulas[0];
      const quando = adiante === 0 ? 'hoje' : adiante === 1 ? 'amanhã' : NOMES[d];
      return `${quando} às ${formatarHora(aula.inicio)}${aula.turma ? ` (${aula.turma})` : ''}`;
    }
  }
  return null;
}
