import * as React from 'react';
import styles from './DashboardCadeias.module.scss';
import { Humor, IFicheiro } from '../models/IModelos';
import { pad } from '../utils/util';
import Mascote from './Mascote';

export interface ICabecalhoProps {
  ficheiros: IFicheiro[];
  ficheiro: string;
  agora: Date;
  humor: Humor;
  resumo: string;
  onFicheiro: (id: string) => void;
}

export default class Cabecalho extends React.Component<ICabecalhoProps> {
  public constructor(props: ICabecalhoProps) {
    super(props);
    this._aoMudarFicheiro = this._aoMudarFicheiro.bind(this);
  }

  public render(): React.ReactElement<ICabecalhoProps> {
    const { ficheiros, ficheiro, agora, humor, resumo } = this.props;
    return (
      <div className={styles.cabecalho}>
        <Mascote humor={humor} />
        <div className={styles.cabecalhoTitulo}>
          <h1>Arranque das cadeias mainframe</h1>
          <div className={styles.cabecalhoSub}>
            {resumo} · atualizado às {pad(agora.getHours())}:{pad(agora.getMinutes())}
          </div>
        </div>
        <label className={styles.cabecalhoFicheiro}>
          Ficheiro fonte
          <select value={ficheiro} onChange={this._aoMudarFicheiro}>
            {ficheiros.map((f) => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>
        </label>
      </div>
    );
  }

  private _aoMudarFicheiro(ev: React.ChangeEvent<HTMLSelectElement>): void {
    this.props.onFicheiro(ev.target.value);
  }
}
