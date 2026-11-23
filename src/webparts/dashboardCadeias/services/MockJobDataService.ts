import { IConfigDashboard, IFicheiro, ILinhaExcel } from '../models/IModelos';
import { IJobDataService } from './IJobDataService';
import { chaveProcesso } from '../utils/config';
import { dataParaChave, minParaHora, minutosDoDia, pad } from '../utils/util';

/**
 * Dados fictícios e determinísticos com a mesma estrutura do Excel.
 * Gera 14 dias; o dia de hoje só tem arranques até à hora atual.
 */
export class MockJobDataService implements IJobDataService {
  private readonly _config: IConfigDashboard;
  private readonly _dias: number;

  public constructor(config: IConfigDashboard, dias = 14) {
    this._config = config;
    this._dias = dias;
  }

  public obterFicheiros(): Promise<IFicheiro[]> {
    return Promise.resolve([
      { id: 'prod', nome: 'cadeias_producao.xlsx' },
      { id: 'qual', nome: 'cadeias_qualidade.xlsx' }
    ]);
  }

  public obterLinhas(ficheiroId: string): Promise<ILinhaExcel[]> {
    let semente: number = ficheiroId === 'prod' ? 11 : 29;
    const rnd = (): number => {
      semente = (semente * 9301 + 49297) % 233280;
      return semente / 233280;
    };
    const base: number[] = [60, 150, 255]; // ~01:00, ~02:30, ~04:15
    const agora: Date = new Date();
    const agoraMin: number = minutosDoDia(agora);
    const linhas: ILinhaExcel[] = [];

    for (let i: number = this._dias - 1; i >= 0; i--) {
      const dia: Date = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - i);
      const chave: string = dataParaChave(dia);
      const hoje: boolean = i === 0;
      this._config.instancias.forEach((inst, ii) => {
        this._config.cadeias.forEach((cad, ci) => {
          const r: number = rnd();
          const r2: number = rnd();
          const seg: number = Math.floor(rnd() * 60);
          const desvio: number = r > 0.95 ? 32 + r2 * 25 : r > 0.88 ? 16 + r2 * 12 : r2 * 10 - 4;
          const naoArrancou: boolean = r < 0.015 || (hoje && ii === 2 && ci === 2);
          const min: number = (base[ci] !== undefined ? base[ci] : 60 + ci * 90) + ii * 3 + desvio;
          if (naoArrancou || (hoje && min > agoraMin)) return;
          linhas.push({
            Data: chave,
            Hora: minParaHora(min) + ':' + pad(seg),
            Processo: chaveProcesso(inst, cad.id),
            Estado: 'started',
            StatusFinal: ''
          });
        });
      });
    }

    return new Promise<ILinhaExcel[]>((resolve) => {
      setTimeout(() => resolve(linhas), 300);
    });
  }
}
