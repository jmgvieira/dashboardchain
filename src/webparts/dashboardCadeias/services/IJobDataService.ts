import { IFicheiro, ILinhaExcel } from '../models/IModelos';

export interface IJobDataService {
  obterFicheiros(): Promise<IFicheiro[]>;
  obterLinhas(ficheiroId: string): Promise<ILinhaExcel[]>;
}
