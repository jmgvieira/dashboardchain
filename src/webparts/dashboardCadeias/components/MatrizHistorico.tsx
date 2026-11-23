import * as React from 'react';
import styles from './DashboardCadeias.module.scss';
import { ICelula, IConfigDashboard, IModelo } from '../models/IModelos';
import { obterCelula } from '../services/modelo';
import { ROTULOS_ESTADO } from '../utils/config';
import { formatarDesvio, minParaHora, rotuloDia, IRotuloDia } from '../utils/util';
import { classeEstado, juntarClasses } from './estilos';

export interface IMatrizHistoricoProps {
  modelo: IModelo;
  dias: string[];
  config: IConfigDashboard;
}

/** Linhas = instância × cadeia; colunas = dias selecionados. */
export default class MatrizHistorico extends React.Component<IMatrizHistoricoProps> {
  public render(): React.ReactElement<IMatrizHistoricoProps> {
    const { modelo, dias, config } = this.props;
    const linhas: React.ReactNode[] = [];

    config.instancias.forEach((inst) => {
      config.cadeias.forEach((c, ci) => {
        linhas.push(
          <tr key={inst + c.id} className={ci === 0 ? styles.matrizPrimeira : undefined}>
            <td className={styles.matrizNome}>
              <span style={{ fontWeight: ci === 0 ? 600 : 400, visibility: ci === 0 ? 'visible' : 'hidden' }}>{inst}</span>{' '}
              <span className={styles.corCadeia} style={{ background: c.cor }} /> {c.nome}
            </td>
            {dias.map((d) => this._celula(obterCelula(modelo, d, inst, c.id)))}
          </tr>
        );
      });
    });

    return (
      <div className={styles.matrizWrap}>
        <table className={styles.matriz}>
          <thead>
            <tr>
              <th />
              {dias.map((d) => {
                const r: IRotuloDia = rotuloDia(d);
                const eHoje: boolean = d === modelo.hoje;
                return (
                  <th key={d} className={eHoje ? styles.matrizHoje : undefined}>
                    {eHoje ? 'hoje' : r.semana}<br />{r.dia} {r.mes}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>{linhas}</tbody>
        </table>
      </div>
    );
  }

  private _celula(cel: ICelula): React.ReactElement {
    const txt: string = cel.inicio !== undefined ? minParaHora(cel.inicio) : cel.estado === 'falta' ? '✕' : '…';
    const titulo: string = cel.processo + ' · ' + cel.dia + ' · ' + ROTULOS_ESTADO[cel.estado] +
      (cel.inicio !== undefined ? ' (' + formatarDesvio(cel.desvio) + ')' : '');
    return (
      <td key={cel.dia} className={juntarClasses(styles.celula, classeEstado(cel.estado))} title={titulo}>
        {txt}
      </td>
    );
  }
}
