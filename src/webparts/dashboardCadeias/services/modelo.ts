import { EstadoArranque, ICelula, IConfigDashboard, IContagem, Humor, ILinhaExcel, IModelo } from '../models/IModelos';
import { chaveProcesso } from '../utils/config';
import { dataParaChave, horaParaMin, mediana, minutosDoDia } from '../utils/util';

/**
 * A partir das linhas do Excel calcula, por dia e por cadeia:
 * hora de início, hora habitual (mediana dos N dias anteriores), desvio e estado.
 */
export function construirModelo(linhas: ILinhaExcel[], agora: Date, config: IConfigDashboard): IModelo {
  const inicios: { [chave: string]: number } = {};
  const diasMapa: { [dia: string]: boolean } = {};

  linhas.forEach((l) => {
    if (String(l.Estado).toLowerCase() !== 'started') return;
    const k: string = l.Data + '|' + l.Processo;
    const m: number = horaParaMin(l.Hora);
    diasMapa[l.Data] = true;
    if (inicios[k] === undefined || m < inicios[k]) inicios[k] = m;
  });

  const hoje: string = dataParaChave(agora);
  diasMapa[hoje] = true;
  const dias: string[] = Object.keys(diasMapa).sort();
  const agoraMin: number = minutosDoDia(agora);
  const celulas: { [chave: string]: ICelula } = {};

  dias.forEach((dia, di) => {
    config.instancias.forEach((inst) => {
      config.cadeias.forEach((cad) => {
        const proc: string = chaveProcesso(inst, cad.id);
        const anteriores: number[] = dias
          .slice(Math.max(0, di - config.janelaHabitual), di)
          .map((d) => inicios[d + '|' + proc])
          .filter((v) => v !== undefined);
        const habitual: number | undefined = mediana(anteriores);
        const inicio: number | undefined = inicios[dia + '|' + proc];
        let estado: EstadoArranque;
        let desvio: number | undefined;

        if (inicio !== undefined) {
          desvio = habitual === undefined ? 0 : inicio - habitual;
          estado = desvio > config.limiarCritico ? 'critico' : desvio > config.limiarAtraso ? 'atrasado' : 'ok';
        } else if (dia < hoje) {
          estado = 'falta';
        } else {
          estado = habitual !== undefined && agoraMin > habitual + config.limiarCritico ? 'falta' : 'porIniciar';
        }

        celulas[dia + '|' + proc] = { dia, instancia: inst, cadeia: cad.id, processo: proc, inicio, habitual, desvio, estado };
      });
    });
  });

  return { dias, celulas, hoje, agoraMin };
}

export function obterCelula(modelo: IModelo, dia: string, instancia: string, cadeia: string): ICelula {
  return modelo.celulas[dia + '|' + chaveProcesso(instancia, cadeia)];
}

export function celulasDosDias(modelo: IModelo, dias: string[], config: IConfigDashboard): ICelula[] {
  const r: ICelula[] = [];
  dias.forEach((d) => {
    config.instancias.forEach((i) => {
      config.cadeias.forEach((c) => {
        const cel: ICelula | undefined = obterCelula(modelo, d, i, c.id);
        if (cel) r.push(cel);
      });
    });
  });
  return r;
}

export function contar(celulas: ICelula[]): IContagem {
  const n: IContagem = { total: celulas.length, ok: 0, atrasado: 0, critico: 0, falta: 0, porIniciar: 0 };
  celulas.forEach((c) => { n[c.estado]++; });
  return n;
}

export function calcularHumor(n: IContagem): Humor {
  if (n.falta) return 'triste';
  if (n.atrasado + n.critico) return 'preocupado';
  return 'feliz';
}
