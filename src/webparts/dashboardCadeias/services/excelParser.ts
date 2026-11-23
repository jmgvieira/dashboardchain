import * as XLSX from 'xlsx';
import { ILinhaExcel } from '../models/IModelos';
import { pad } from '../utils/util';

/** Nomes aceites para cada coluna (comparação sem acentos e sem maiúsculas). */
const COLUNAS: { [campo: string]: string[] } = {
  Data: ['data', 'date', 'dia'],
  Hora: ['hora', 'time', 'hh:mm:ss'],
  Processo: ['nome do processo', 'processo', 'nome processo', 'job', 'nome'],
  Estado: ['estado', 'state', 'status'],
  StatusFinal: ['status final', 'estado final', 'resultado', 'rc']
};

function normalizarTexto(v: unknown): string {
  return String(v === undefined || v === null ? '' : v)
    .toLowerCase()
    .replace(/[áàãâä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[íìîï]/g, 'i')
    .replace(/[óòõôö]/g, 'o').replace(/[úùûü]/g, 'u').replace(/ç/g, 'c')
    .replace(/\s+/g, ' ').trim();
}

/** Converte data Excel (nº de série, Date ou texto) para yyyy/mm/dd. */
function normalizarData(v: unknown): string {
  if (typeof v === 'number') {
    const d: Date = new Date(Math.round((Math.floor(v) - 25569) * 86400000));
    return d.getUTCFullYear() + '/' + pad(d.getUTCMonth() + 1) + '/' + pad(d.getUTCDate());
  }
  if (v instanceof Date) {
    return v.getFullYear() + '/' + pad(v.getMonth() + 1) + '/' + pad(v.getDate());
  }
  const s: string = String(v).trim();
  let m: RegExpMatchArray | null = s.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/);
  if (m) return m[1] + '/' + pad(Number(m[2])) + '/' + pad(Number(m[3]));
  m = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})/);
  if (m) return m[3] + '/' + pad(Number(m[2])) + '/' + pad(Number(m[1]));
  return s;
}

/** Converte hora Excel (fração do dia, Date ou texto) para hh:mm:ss. */
function normalizarHora(v: unknown): string {
  if (typeof v === 'number') {
    const seg: number = Math.round((v - Math.floor(v)) * 86400);
    return pad(Math.floor(seg / 3600)) + ':' + pad(Math.floor((seg % 3600) / 60)) + ':' + pad(seg % 60);
  }
  if (v instanceof Date) {
    return pad(v.getHours()) + ':' + pad(v.getMinutes()) + ':' + pad(v.getSeconds());
  }
  const m: RegExpMatchArray | null = String(v).trim().match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  return m ? pad(Number(m[1])) + ':' + m[2] + ':' + (m[3] || '00') : String(v);
}

/**
 * Lê a primeira sheet (ou a indicada), procura a linha de cabeçalho nas primeiras 30 linhas
 * e devolve as linhas normalizadas. Funciona também quando a tabela não começa em A1.
 */
export function lerLinhasExcel(wb: XLSX.WorkBook, nomeSheet?: string): ILinhaExcel[] {
  const nome: string = nomeSheet && wb.Sheets[nomeSheet] ? nomeSheet : wb.SheetNames[0];
  const ws: XLSX.WorkSheet = wb.Sheets[nome];
  const linhas: unknown[][] = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: true, blankrows: false });

  let iCab = -1;
  const indices: { [campo: string]: number } = {};
  for (let i = 0; i < Math.min(30, linhas.length) && iCab < 0; i++) {
    const cab: string[] = (linhas[i] || []).map(normalizarTexto);
    const encontrados: { [campo: string]: number } = {};
    Object.keys(COLUNAS).forEach((campo) => {
      for (let j = 0; j < cab.length; j++) {
        if (COLUNAS[campo].indexOf(cab[j]) >= 0 && encontrados[campo] === undefined) encontrados[campo] = j;
      }
    });
    if (encontrados.Data !== undefined && encontrados.Hora !== undefined && encontrados.Processo !== undefined) {
      iCab = i;
      Object.keys(encontrados).forEach((k) => { indices[k] = encontrados[k]; });
    }
  }
  if (iCab < 0) {
    throw new Error('Não encontrei o cabeçalho (Data, Hora, Nome do processo) na sheet "' + nome + '".');
  }

  const valor = (linha: unknown[], campo: string): unknown =>
    indices[campo] === undefined ? '' : linha[indices[campo]];

  const resultado: ILinhaExcel[] = [];
  for (let i = iCab + 1; i < linhas.length; i++) {
    const l: unknown[] = linhas[i] || [];
    const data: unknown = valor(l, 'Data');
    const processo: unknown = valor(l, 'Processo');
    if (data === '' || data === undefined || processo === '' || processo === undefined) continue;
    resultado.push({
      Data: normalizarData(data),
      Hora: normalizarHora(valor(l, 'Hora')),
      Processo: String(processo).trim(),
      Estado: normalizarTexto(valor(l, 'Estado')),
      StatusFinal: String(valor(l, 'StatusFinal') || '').trim()
    });
  }
  return resultado;
}
