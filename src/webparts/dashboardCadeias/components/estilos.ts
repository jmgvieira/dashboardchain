import styles from './DashboardCadeias.module.scss';
import { EstadoArranque } from '../models/IModelos';

const CLASSES_ESTADO: { [estado in EstadoArranque]: string } = {
  ok: styles.estadoOk,
  atrasado: styles.estadoAtrasado,
  critico: styles.estadoCritico,
  falta: styles.estadoFalta,
  porIniciar: styles.estadoPorIniciar
};

export function classeEstado(estado: EstadoArranque): string {
  return CLASSES_ESTADO[estado];
}

export function juntarClasses(...classes: Array<string | false | undefined>): string {
  return classes.filter((c) => !!c).join(' ');
}

/** Cores usadas nos SVG (atributos SVG não aceitam var() de forma fiável). */
export const CORES_SVG = {
  ok: '#107c10',
  atrasado: '#c19c00',
  critico: '#c43e00',
  falta: '#c50f1f',
  pendente: '#c8c6c4',
  grelha: '#edebe9',
  linha: '#e1dfdd',
  texto: '#242424',
  texto2: '#616161'
};
