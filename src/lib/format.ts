const brlInt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const brlDec = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatBRL(value: number): string {
  return `R$ ${brlDec.format(value)}`;
}

export function formatBRLRounded(value: number): string {
  return `R$ ${brlInt.format(Math.round(value))}`;
}

/** Converte "AAAA-MM-DD" em Date local (evita deslocamento de fuso do parser ISO). */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString('pt-BR');
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const day = date.toLocaleDateString('pt-BR');
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${day} ${time}`;
}

export function formatDayMonth(iso: string): string {
  const date = parseISODate(iso);
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatWeekdayDayMonth(iso: string): string {
  const date = parseISODate(iso);
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${formatDayMonth(iso)}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function greeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}
