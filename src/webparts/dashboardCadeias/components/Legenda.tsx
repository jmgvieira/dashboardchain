import * as React from 'react';
import styles from './DashboardCadeias.module.scss';
import { ORDEM_ESTADOS, ROTULOS_ESTADO } from '../utils/config';
import { classeEstado, juntarClasses } from './estilos';

export interface ILegendaProps {
  janelaHabitual: number;
}

export default class Legenda extends React.Component<ILegendaProps> {
  public render(): React.ReactElement<ILegendaProps> {
    return (
      <div className={styles.legenda}>
        {ORDEM_ESTADOS.map((e) => (
          <span key={e} className={styles.legendaItem}>
            <span className={juntarClasses(styles.legendaAmostra, classeEstado(e))} />
            {ROTULOS_ESTADO[e]}
          </span>
        ))}
        <span className={styles.legendaItem}>Habitual = mediana dos últimos {this.props.janelaHabitual} dias</span>
      </div>
    );
  }
}
