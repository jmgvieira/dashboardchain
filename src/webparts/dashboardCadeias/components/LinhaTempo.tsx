import * as React from 'react';
import styles from './DashboardCadeias.module.scss';
import { ICadeiaConfig, ICelula, IConfigDashboard, IModelo } from '../models/IModelos';
import { celulasDosDias, obterCelula } from '../services/modelo';
import { ROTULOS_ESTADO } from '../utils/config';
import { formatarDesvio, minParaHora, pad } from '../utils/util';
import { CORES_SVG } from './estilos';

export interface ILinhaTempoProps {
  modelo: IModelo;
  dia: string;
  config: IConfigDashboard;
}

const W = 960;
const MARGEM_ESQ = 90;
const MARGEM_DIR = 70;
const TOPO = 30;
const ALTURA_LINHA = 44;

/** Uma faixa por instância; ponto = arranque, tracejado = hora habitual. */
export default class LinhaTempo extends React.Component<ILinhaTempoProps> {
  private _h0 = 0;
  private _h1 = 24;

  public render(): React.ReactElement<ILinhaTempoProps> {
    const { modelo, dia, config } = this.props;
    const eHoje: boolean = dia === modelo.hoje;

    const valores: number[] = [];
    celulasDosDias(modelo, [dia], config).forEach((c) => {
      if (c.inicio !== undefined) valores.push(c.inicio);
      if (c.habitual !== undefined) valores.push(c.habitual);
    });
    if (!valores.length) valores.push(0, 360);
    const maxDados: number = Math.max.apply(null, valores);
    const mostrarAgora: boolean = eHoje && modelo.agoraMin <= maxDados + 120;
    if (mostrarAgora) valores.push(modelo.agoraMin);
    this._h0 = Math.max(0, Math.floor((Math.min.apply(null, valores) - 20) / 60));
    this._h1 = Math.min(24, Math.ceil((Math.max.apply(null, valores) + 20) / 60));

    const H: number = TOPO + config.instancias.length * ALTURA_LINHA + 10;
    const horas: number[] = [];
    for (let h: number = this._h0; h <= this._h1; h++) horas.push(h);

    return (
      <svg className={styles.timeline} viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label="Linha do tempo de arranques por instância">
        {horas.map((h) => (
          <g key={h}>
            <line x1={this._x(h * 60)} x2={this._x(h * 60)} y1={TOPO - 8} y2={H - 6} stroke={CORES_SVG.grelha} />
            <text x={this._x(h * 60)} y={16} fontSize="12" fill={CORES_SVG.texto2} textAnchor="middle">{pad(h)}:00</text>
          </g>
        ))}
        {mostrarAgora && (
          <g>
            <line x1={this._x(modelo.agoraMin)} x2={this._x(modelo.agoraMin)} y1={TOPO - 8} y2={H - 6} stroke={CORES_SVG.falta} strokeDasharray="4 3" />
            <text x={this._x(modelo.agoraMin) + 4} y={TOPO - 10} fontSize="11" fill={CORES_SVG.falta}>agora</text>
          </g>
        )}
        {config.instancias.map((inst, i) => {
          const y: number = TOPO + i * ALTURA_LINHA + ALTURA_LINHA / 2;
          return (
            <g key={inst}>
              <text x={0} y={y + 4} fontSize="13" fontWeight="600" fill={CORES_SVG.texto}>{inst}</text>
              <line x1={MARGEM_ESQ} x2={W - MARGEM_DIR} y1={y} y2={y} stroke={CORES_SVG.linha} />
              {config.cadeias.map((c) => this._marcas(obterCelula(modelo, dia, inst, c.id), c, y))}
            </g>
          );
        })}
      </svg>
    );
  }

  private _x(m: number): number {
    return MARGEM_ESQ + ((m - this._h0 * 60) / ((this._h1 - this._h0) * 60)) * (W - MARGEM_ESQ - MARGEM_DIR);
  }

  private _marcas(cel: ICelula, c: ICadeiaConfig, y: number): React.ReactElement {
    const partes: React.ReactNode[] = [];

    if (cel.habitual !== undefined) {
      partes.push(
        <line key="h" x1={this._x(cel.habitual)} x2={this._x(cel.habitual)} y1={y - 11} y2={y + 11}
          stroke={c.cor} strokeWidth="2" strokeDasharray="2 2" />
      );
    }

    if (cel.inicio !== undefined) {
      if ((cel.estado === 'atrasado' || cel.estado === 'critico') && cel.habitual !== undefined) {
        const corA: string = cel.estado === 'critico' ? CORES_SVG.critico : CORES_SVG.atrasado;
        partes.push(<line key="a" x1={this._x(cel.habitual)} x2={this._x(cel.inicio) - 8} y1={y} y2={y} stroke={corA} strokeWidth="3" />);
        partes.push(<text key="t" x={this._x(cel.inicio) + 11} y={y - 8} fontSize="11" fontWeight="600" fill={corA}>{formatarDesvio(cel.desvio)}</text>);
      }
      partes.push(
        <circle key="p" cx={this._x(cel.inicio)} cy={y} r="8" fill={c.cor} stroke="#fff" strokeWidth="2">
          <title>{cel.processo} arrancou às {minParaHora(cel.inicio)} ({formatarDesvio(cel.desvio)})</title>
        </circle>
      );
    } else if (cel.habitual !== undefined) {
      const falta: boolean = cel.estado === 'falta';
      const cx: number = this._x(cel.habitual);
      partes.push(
        <g key="f" className={falta ? styles.pulsar : undefined}>
          <circle cx={cx} cy={y} r="7" fill="#fff" stroke={falta ? CORES_SVG.falta : c.cor} strokeWidth="2" />
          {falta && <path d={'M' + (cx - 3) + ' ' + (y - 3) + ' l6 6 m0 -6 l-6 6'} stroke={CORES_SVG.falta} strokeWidth="2" />}
          <title>{cel.processo} · {ROTULOS_ESTADO[cel.estado]} (habitual {minParaHora(cel.habitual)})</title>
        </g>
      );
    }

    return <g key={c.id}>{partes}</g>;
  }
}
