import { EstadoArranque, IConfigDashboard } from '../models/IModelos';

export const CONFIG_PADRAO: IConfigDashboard = {
  instancias: ['INST01', 'INST02', 'INST03', 'INST04', 'INST05', 'INST06'],
  cadeias: [
    { id: 'C1', nome: 'Cadeia 1', cor: '#4f6bed' },
    { id: 'C2', nome: 'Cadeia 2', cor: '#0f7b6c' },
    { id: 'C3', nome: 'Cadeia 3', cor: '#8764b8' }
  ],
  janelaHabitual: 10,
  limiarAtraso: 15,
  limiarCritico: 30
};

export const ROTULOS_ESTADO: { [estado in EstadoArranque]: string } = {
  ok: 'No horário',
  atrasado: 'Atrasada 15–30 min',
  critico: 'Atrasada +30 min',
  falta: 'Não arrancou',
  porIniciar: 'Por iniciar'
};

export const ORDEM_ESTADOS: EstadoArranque[] = ['ok', 'atrasado', 'critico', 'falta', 'porIniciar'];

/**
 * Convenção PROVISÓRIA: o nome do processo é <INSTANCIA>_<CADEIA> (ex. INST01_C2).
 * Quando o Excel real tiver colunas próprias, ou outro padrão, muda-se só aqui.
 */
export function chaveProcesso(instancia: string, cadeia: string): string {
  return instancia + '_' + cadeia;
}
