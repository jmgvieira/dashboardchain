import * as React from 'react';
import styles from './DashboardCadeias.module.scss';

export interface ISeccaoProps {
  titulo: string;
  sub?: string;
}

export default class Seccao extends React.Component<ISeccaoProps> {
  public render(): React.ReactElement<ISeccaoProps> {
    return (
      <section className={styles.seccao}>
        <div className={styles.seccaoTitulo}>
          <h2>{this.props.titulo}</h2>
          {this.props.sub && <span>{this.props.sub}</span>}
        </div>
        {this.props.children}
      </section>
    );
  }
}
