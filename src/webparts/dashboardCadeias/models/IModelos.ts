/** Uma linha da tabela Excel, já normalizada. */
export interface ILinhaExcel {
  /** yyyy/mm/dd */
  Data: string;
  /** hh:mm:ss */
  Hora: string;
  Processo: string;
  /** planned | started | ended */
  Estado: string;
  StatusFinal: string;
}

export interface IFicheiro {
  /** No mock é um id; no SharePoint é o ServerRelativeUrl do ficheiro. */
  id: string;
  nome: string;
}

export interface ICadeiaConfig {
  id: string;
  nome: string;
  /** Cor em hex (é usada em atributos SVG, onde var() não é fiável). */
  cor: string;
}

export interface IConfigDashboard {
  instancias: string[];
  cadeias: ICadeiaConfig[];
  /** Nº de dias anteriores usados para calcular a hora habitual (mediana). */
  janelaHabitual: number;
  /** Minutos acima do habitual a partir dos quais a cadeia está atrasada. */
  limiarAtraso: number;
  /** Minutos acima do habitual para "muito atrasada" e tolerância para "não arrancou". */
  limiarCritico: number;
}

export type EstadoArranque = 'ok' | 'atrasado' | 'critico' | 'falta' | 'porIniciar';

export interface ICelula {
  dia: string;
  instancia: string;
  cadeia: string;
  processo: string;
  /** Minutos desde a meia-noite; undefined se ainda não arrancou. */
  inicio?: number;
  habitual?: number;
  desvio?: number;
  estado: EstadoArranque;
}

export interface IModelo {
  dias: string[];
  celulas: { [chave: string]: ICelula };
  hoje: string;
  agoraMin: number;
}

export interface IContagem {
  total: number;
  ok: number;
  atrasado: number;
  critico: number;
  falta: number;
  porIniciar: number;
}

export type Humor = 'feliz' | 'preocupado' | 'triste';
