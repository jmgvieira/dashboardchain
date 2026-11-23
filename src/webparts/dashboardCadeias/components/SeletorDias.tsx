import * as React from 'react';
import styles from './DashboardCadeias.module.scss';
import { rotuloDia, IRotuloDia } from '../utils/util';
import { juntarClasses } from './estilos';

export interface ISeletorDiasProps {
  dias: string[];
  selecionados: string[];
  hoje: string;
  /** Cor do ponto por dia (resumo do estado desse dia). */
  pontos: { [dia: string]: string };
  onChange: (dias: string[]) => void;
}

export default class SeletorDias extends React.Component<ISeletorDiasProps> {
  private _ancora: string | undefined;

  public constructor(props: ISeletorDiasProps) {
    super(props);
    this._aoClicarDia = this._aoClicarDia.bind(this);
    this._hoje = this._hoje.bind(this);
    this._ultimos7 = this._ultimos7.bind(this);
    this._todos = this._todos.bind(this);
  }

  public render(): React.ReactElement<ISeletorDiasProps> {
    const { dias, selecionados, hoje, pontos } = this.props;
    return (
      <div className={styles.dias}>
        <div className={styles.diasLista} role="listbox" aria-multiselectable="true" aria-label="Dias">
          {dias.map((d) => {
            const r: IRotuloDia = rotuloDia(d);
            const sel: boolean = selecionados.indexOf(d) >= 0;
            return (
              <button
                key={d}
                type="button"
                data-dia={d}
                role="option"
                aria-selected={sel}
                title={r.semana + ' ' + r.dia + ' ' + r.mes}
                className={juntarClasses(styles.dia, sel && styles.diaSel, d === hoje && styles.diaHoje)}
                onClick={this._aoClicarDia}
              >
                <span className={styles.diaSemana}>{d === hoje ? 'hoje' : r.semana}</span>
                <span className={styles.diaNum}>{r.dia}</span>
                <span className={styles.diaPonto} style={{ background: pontos[d] }} />
              </button>
            );
          })}
        </div>
        <div className={styles.diasAtalhos}>
          <button type="button" className={styles.botao} onClick={this._hoje}>Hoje</button>
          <button type="button" className={styles.botao} onClick={this._ultimos7}>Últimos 7</button>
          <button type="button" className={styles.botao} onClick={this._todos}>Todos</button>
        </div>
        <div className={styles.diasDica}>
          Clique para um dia · Ctrl+clique para juntar dias · Shift+clique para um intervalo
        </div>
      </div>
    );
  }

  private _aoClicarDia(ev: React.MouseEvent<HTMLButtonElement>): void {
    const dia: string | null = ev.currentTarget.getAttribute('data-dia');
    if (!dia) return;
    const { dias, selecionados } = this.props;
    let novo: string[];

    if (ev.shiftKey && this._ancora) {
      const a: number = dias.indexOf(this._ancora);
      const b: number = dias.indexOf(dia);
      novo = dias.slice(Math.min(a, b), Math.max(a, b) + 1);
    } else if (ev.ctrlKey || ev.metaKey) {
      novo = selecionados.indexOf(dia) >= 0 ? selecionados.filter((d) => d !== dia) : selecionados.concat([dia]);
      if (!novo.length) novo = [dia];
      this._ancora = dia;
    } else {
      novo = [dia];
      this._ancora = dia;
    }
    this.props.onChange(novo.slice().sort());
  }

  private _hoje(): void {
    this.props.onChange([this.props.hoje]);
  }

  private _ultimos7(): void {
    const { dias } = this.props;
    this.props.onChange(dias.slice(Math.max(0, dias.length - 7)));
  }

  private _todos(): void {
    this.props.onChange(this.props.dias.slice());
  }
}
