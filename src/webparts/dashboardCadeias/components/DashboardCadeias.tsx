import * as React from 'react';
import styles from './DashboardCadeias.module.scss';
import { IDashboardCadeiasProps } from './IDashboardCadeiasProps';
import { IContagem, IFicheiro, ILinhaExcel, IModelo, Humor } from '../models/IModelos';
import { calcularHumor, celulasDosDias, construirModelo, contar } from '../services/modelo';
import { dataParaChave, rotuloDia, IRotuloDia } from '../utils/util';
import { CORES_SVG } from './estilos';
import Cabecalho from './Cabecalho';
import SeletorDias from './SeletorDias';
import Kpis from './Kpis';
import Seccao from './Seccao';
import GrelhaArranques from './GrelhaArranques';
import LinhaTempo from './LinhaTempo';
import MatrizHistorico from './MatrizHistorico';
import Legenda from './Legenda';

export interface IDashboardCadeiasState {
  ficheiros: IFicheiro[];
  ficheiro: string;
  linhas: ILinhaExcel[];
  aCarregar: boolean;
  erro?: string;
  agora: Date;
  selecionados: string[];
}

export default class DashboardCadeias extends React.Component<IDashboardCadeiasProps, IDashboardCadeiasState> {
  private _relogio: number | undefined;
  private _recarga: number | undefined;

  public constructor(props: IDashboardCadeiasProps) {
    super(props);
    this.state = { ficheiros: [], ficheiro: '', linhas: [], aCarregar: true, agora: new Date(), selecionados: [] };
    this._aoMudarFicheiro = this._aoMudarFicheiro.bind(this);
    this._aoMudarDias = this._aoMudarDias.bind(this);
  }

  public componentDidMount(): void {
    this._iniciar();
    // Atualiza "agora" a cada minuto (estados por iniciar → não arrancou).
    this._relogio = window.setInterval(() => this.setState({ agora: new Date() }), 60000);
    this._programarRecarga();
  }

  public componentDidUpdate(anteriores: IDashboardCadeiasProps): void {
    if (anteriores.servico !== this.props.servico) {
      this.setState({ ficheiros: [], ficheiro: '', linhas: [] });
      this._iniciar();
    }
    if (anteriores.atualizarMin !== this.props.atualizarMin) this._programarRecarga();
  }

  public componentWillUnmount(): void {
    window.clearInterval(this._relogio);
    window.clearInterval(this._recarga);
  }

  public render(): React.ReactElement<IDashboardCadeiasProps> {
    const { config } = this.props;
    const { ficheiros, ficheiro, linhas, aCarregar, erro, agora, selecionados } = this.state;

    const modelo: IModelo = construirModelo(linhas, agora, config);
    const sel: string[] = selecionados.filter((d) => modelo.dias.indexOf(d) >= 0);
    if (!sel.length) sel.push(modelo.hoje);

    const contagem: IContagem = contar(celulasDosDias(modelo, sel, config));
    const contHoje: IContagem = contar(celulasDosDias(modelo, [modelo.hoje], config));
    const humor: Humor = calcularHumor(contHoje);
    const atrasadasHoje: number = contHoje.atrasado + contHoje.critico;
    const resumo: string = contHoje.falta
      ? contHoje.falta + ' cadeia(s) sem arranque hoje'
      : atrasadasHoje
        ? atrasadasHoje + ' arranque(s) atrasado(s) hoje'
        : 'Todos os arranques de hoje dentro do habitual';

    const pontos: { [dia: string]: string } = {};
    modelo.dias.forEach((d) => {
      const n: IContagem = contar(celulasDosDias(modelo, [d], config));
      pontos[d] = n.falta ? CORES_SVG.falta : n.critico ? CORES_SVG.critico : n.atrasado ? CORES_SVG.atrasado
        : n.porIniciar ? CORES_SVG.pendente : CORES_SVG.ok;
    });

    return (
      <div className={styles.dashboard}>
        <Cabecalho ficheiros={ficheiros} ficheiro={ficheiro} agora={agora} humor={humor} resumo={resumo} onFicheiro={this._aoMudarFicheiro} />
        <SeletorDias dias={modelo.dias} selecionados={sel} hoje={modelo.hoje} pontos={pontos} onChange={this._aoMudarDias} />
        {erro && <div className={styles.erro}>{erro}</div>}
        {aCarregar ? <div className={styles.carregar}>A carregar dados…</div> : this._conteudo(modelo, sel, contagem)}
      </div>
    );
  }

  private _conteudo(modelo: IModelo, sel: string[], contagem: IContagem): React.ReactElement {
    const { config } = this.props;
    let corpo: React.ReactElement;

    if (sel.length === 1) {
      const r: IRotuloDia =rotuloDia(sel[0]);
      const sub: string = (sel[0] === modelo.hoje ? 'Hoje, ' : '') + r.dia + ' ' + r.mes;
      corpo = (
        <React.Fragment>
          <Seccao titulo="Arranque por instância e cadeia" sub={sub}>
            <GrelhaArranques modelo={modelo} dia={sel[0]} config={config} />
          </Seccao>
          <Seccao titulo="Linha do tempo" sub="ponto = arranque · tracejado = hora habitual">
            <LinhaTempo modelo={modelo} dia={sel[0]} config={config} />
          </Seccao>
        </React.Fragment>
      );
    } else {
      corpo = (
        <Seccao titulo="Histórico de arranques" sub={sel.length + ' dias selecionados'}>
          <MatrizHistorico modelo={modelo} dias={sel} config={config} />
        </Seccao>
      );
    }

    return (
      <React.Fragment>
        <Kpis contagem={contagem} limiarCritico={config.limiarCritico} />
        {corpo}
        <Legenda janelaHabitual={config.janelaHabitual} />
      </React.Fragment>
    );
  }

  private _iniciar(): void {
    this.props.servico.obterFicheiros()
      .then((fs) => {
        if (!fs.length) {
          this.setState({ aCarregar: false, erro: 'Não há ficheiros Excel na pasta configurada.' });
          return;
        }
        this.setState({ ficheiros: fs, ficheiro: fs[0].id }, () => this._carregar());
      })
      .catch((e: Error) => this.setState({ aCarregar: false, erro: 'Erro a listar ficheiros: ' + e.message }));
  }

  private _carregar(): void {
    if (!this.state.ficheiro) return;
    this.setState({ aCarregar: true, erro: undefined });
    this.props.servico.obterLinhas(this.state.ficheiro)
      .then((linhas) => {
        const hoje: string = dataParaChave(new Date());
        this.setState((s) => ({
          linhas,
          aCarregar: false,
          agora: new Date(),
          selecionados: s.selecionados.length ? s.selecionados : [hoje]
        }));
      })
      .catch((e: Error) => this.setState({ aCarregar: false, erro: 'Erro a ler o ficheiro: ' + e.message }));
  }

  private _programarRecarga(): void {
    window.clearInterval(this._recarga);
    if (this.props.atualizarMin > 0) {
      this._recarga = window.setInterval(() => this._carregar(), this.props.atualizarMin * 60000);
    }
  }

  private _aoMudarFicheiro(id: string): void {
    this.setState({ ficheiro: id }, () => this._carregar());
  }

  private _aoMudarDias(dias: string[]): void {
    this.setState({ selecionados: dias });
  }
}
