// Nota: o tsconfig do SPFx usa target es5 com lib limitada, por isso evita-se
// padStart, Array.from, find, includes e spread de Set.

const SEMANA: string[] = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const MESES: string[] = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export interface IRotuloDia {
  semana: string;
  dia: number;
  mes: string;
}

export function pad(n: number): string {
  return n < 10 ? '0' + n : String(n);
}

export function dataParaChave(d: Date): string {
  return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate());
}

export function chaveParaData(k: string): Date {
  const p: number[] = k.split('/').map(Number);
  return new Date(p[0], p[1] - 1, p[2]);
}

export function horaParaMin(h: string): number {
  const p: number[] = String(h).split(':').map(Number);
  return p[0] * 60 + (p[1] || 0) + (p[2] || 0) / 60;
}

export function minParaHora(m: number): string {
  const t: number = Math.floor(m);
  return pad(Math.floor(t / 60)) + ':' + pad(t % 60);
}

export function mediana(valores: number[]): number | undefined {
  if (!valores.length) return undefined;
  const s: number[] = valores.slice().sort((a, b) => a - b);
  const k: number = Math.floor(s.length / 2);
  return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2;
}

export function formatarDesvio(d: number | undefined): string {
  if (d === undefined) return '';
  const r: number = Math.round(d);
  if (r === 0) return '±0 min';
  return (r > 0 ? '+' : '−') + Math.abs(r) + ' min';
}

export function rotuloDia(k: string): IRotuloDia {
  const d: Date = chaveParaData(k);
  return { semana: SEMANA[d.getDay()], dia: d.getDate(), mes: MESES[d.getMonth()] };
}

export function minutosDoDia(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}
