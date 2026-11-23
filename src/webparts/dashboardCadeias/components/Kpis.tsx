import * as React from 'react';
import styles from './DashboardCadeias.module.scss';
import { IContagem } from '../models/IModelos';
import { juntarClasses } from './estilos';

export interface IKpisProps {
  contagem: IContagem;
  limiarCritico: number;
}

export default class Kpis extends React.Component<IKpisProps> {
  public render(): React.ReactElement<IKpisProps> {
    const n: IContagem = this.props.contagem;
    const atrasadas: number = n.atrasado + n.critico;
    const arrancaram: number = n.ok + atrasadas;
    const pct: number = n.total ? Math.round((n.ok / n.total) * 100) : 0;

    return (
      <div className={styles.kpis}>
        {this._kpi('Arranques esperados', n.total, arrancaram + ' já arrancaram')}
        {this._kpi('No horário', n.ok, pct + '% do total', styles.kpiOk)}
        {this._kpi('Atrasadas', atrasadas, n.critico + ' com mais de ' + this.props.limiarCritico + ' min', styles.kpiAtrasado)}
        {this._kpi('Não arrancaram', n.falta, 'fora da tolerância', styles.kpiFalta)}
        {this._kpi('Por iniciar', n.porIniciar, 'dentro do habitual', styles.kpiPendente)}
      </div>
    );
  }

  private _kpi(rotulo: string, valor: number, extra: string, classe?: string): React.ReactElement {
    return (
      <div className={juntarClasses(styles.kpi, classe)}>
        <div className={styles.kpiRotulo}>{rotulo}</div>
        <div className={styles.kpiValor}>{valor}</div>
        <div className={styles.kpiExtra}>{extra}</div>
      </div>
    );
  }
}
