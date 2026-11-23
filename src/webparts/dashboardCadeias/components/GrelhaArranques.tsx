import * as React from 'react';
import styles from './DashboardCadeias.module.scss';
import { ICelula, IConfigDashboard, IModelo } from '../models/IModelos';
import { obterCelula } from '../services/modelo';
import { ROTULOS_ESTADO } from '../utils/config';
import { formatarDesvio, minParaHora } from '../utils/util';
import { classeEstado, juntarClasses } from './estilos';

export interface IGrelhaArranquesProps {
  modelo: IModelo;
  dia: string;
  config: IConfigDashboard;
}

/** Grelha instâncias (linhas) × cadeias (colunas) com a hora de arranque de um dia. */
export default class GrelhaArranques extends React.Component<IGrelhaArranquesProps> {
  public render(): React.ReactElement<IGrelhaArranquesProps> {
    const { modelo, dia, config } = this.props;
    const itens: React.ReactNode[] = [<div key="vazio" />];

    config.cadeias.forEach((c) => {
      itens.push(
        <div key={'cab' + c.id} className={styles.grelhaCab}>
          <span className={styles.corCadeia} style={{ background: c.cor }} />
          {c.nome}
        </div>
      );
    });

    config.instancias.forEach((inst) => {
      itens.push(<div key={inst} className={styles.grelhaInst}>{inst}</div>);
      config.cadeias.forEach((c) => {
        itens.push(this._mosaico(obterCelula(modelo, dia, inst, c.id)));
      });
    });

    return (
      <div className={styles.grelha} style={{ gridTemplateColumns: '90px repeat(' + config.cadeias.length + ', minmax(0, 1fr))' }}>
        {itens}
      </div>
    );
  }

  private _mosaico(cel: ICelula): React.ReactElement {
    const hab: string = cel.habitual !== undefined ? 'habitual ' + minParaHora(cel.habitual) : 'sem histórico';
    let hora: string;
    let desvio: string;
    if (cel.inicio !== undefined) {
      hora = minParaHora(cel.inicio);
      desvio = formatarDesvio(cel.desvio);
    } else {
      hora = '—';
      desvio = cel.estado === 'falta' ? 'não arrancou' : 'por iniciar';
    }

    return (
      <div
        key={cel.processo}
        className={juntarClasses(styles.mosaico, classeEstado(cel.estado))}
        title={cel.processo + ' · ' + ROTULOS_ESTADO[cel.estado]}
      >
        <span className={styles.mosaicoHora}>{hora}</span>
        <span className={styles.mosaicoDesvio}>{desvio}</span>
        <span className={styles.mosaicoHab}>{hab}</span>
      </div>
    );
  }
}
