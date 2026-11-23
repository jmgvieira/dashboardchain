import { IConfigDashboard } from '../models/IModelos';
import { IJobDataService } from '../services/IJobDataService';

export interface IDashboardCadeiasProps {
  servico: IJobDataService;
  config: IConfigDashboard;
  /** Intervalo de atualização automática em minutos (0 = desligado). */
  atualizarMin: number;
}
