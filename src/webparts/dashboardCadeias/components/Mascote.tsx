import * as React from 'react';
import styles from './DashboardCadeias.module.scss';
import { Humor } from '../models/IModelos';
import { CORES_SVG } from './estilos';

export interface IMascoteProps {
  humor: Humor;
}

export default class Mascote extends React.Component<IMascoteProps> {
  public render(): React.ReactElement<IMascoteProps> {
    const { humor } = this.props;
    const cor: string = humor === 'feliz' ? CORES_SVG.ok : humor === 'preocupado' ? CORES_SVG.atrasado : CORES_SVG.falta;
    const boca: string = humor === 'feliz' ? 'M24 40 Q32 47 40 40' : humor === 'preocupado' ? 'M24 43 L40 41' : 'M24 45 Q32 38 40 45';

    return (
      <svg className={styles.mascote} viewBox="0 0 64 64" role="img" aria-label={'Estado geral: ' + humor}>
        <rect x="8" y="4" width="48" height="56" rx="6" fill="#f3f2f1" stroke="#605e5c" strokeWidth="2" />
        <rect x="14" y="10" width="36" height="40" rx="4" fill="#fff" stroke="#c8c6c4" />
        <ellipse className={styles.mascoteOlho} cx="25" cy="28" rx="3" ry="4" fill="#242424" />
        <ellipse className={styles.mascoteOlho} cx="39" cy="28" rx="3" ry="4" fill="#242424" />
        {humor === 'preocupado' && (
          <path d="M20 20 L29 22 M44 20 L35 22" stroke="#242424" strokeWidth="2" strokeLinecap="round" />
        )}
        <path d={boca} stroke="#242424" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <g>
          <circle className={styles.mascoteLed} cx="20" cy="55" r="2" fill={cor} />
          <circle className={styles.mascoteLed} cx="27" cy="55" r="2" fill={cor} />
          <circle className={styles.mascoteLed} cx="34" cy="55" r="2" fill={cor} />
        </g>
        <rect x="40" y="53.5" width="10" height="3" rx="1" fill="#a19f9d" />
      </svg>
    );
  }
}
