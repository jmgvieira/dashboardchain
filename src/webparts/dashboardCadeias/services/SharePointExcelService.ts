import { WebPartContext } from '@microsoft/sp-webpart-base';
import { spfi, SPFI, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/folders';
import '@pnp/sp/files';
import * as XLSX from 'xlsx';
import { IFicheiro, ILinhaExcel } from '../models/IModelos';
import { IJobDataService } from './IJobDataService';
import { lerLinhasExcel } from './excelParser';

/**
 * Lê ficheiros Excel de uma pasta de uma biblioteca de documentos do SharePoint.
 * O Excel é lido no browser com SheetJS; não há chamadas a servidores externos.
 */
export class SharePointExcelService implements IJobDataService {
  private readonly _sp: SPFI;
  private readonly _pasta: string;
  private readonly _nomeSheet?: string;

  /**
   * @param pasta ServerRelativeUrl da pasta, ex. /sites/Operacoes/Shared Documents/Jobs
   * @param nomeSheet opcional; por omissão usa a primeira sheet
   */
  public constructor(context: WebPartContext, pasta: string, nomeSheet?: string) {
    this._sp = spfi().using(SPFx(context));
    this._pasta = pasta;
    this._nomeSheet = nomeSheet;
  }

  public obterFicheiros(): Promise<IFicheiro[]> {
    return this._sp.web
      .getFolderByServerRelativePath(this._pasta)
      .files.select('Name', 'ServerRelativeUrl', 'TimeLastModified')
      .orderBy('TimeLastModified', false)()
      .then((ficheiros) =>
        ficheiros
          .filter((f) => /\.(xlsx|xlsm|xls)$/i.test(f.Name))
          .map((f) => ({ id: f.ServerRelativeUrl, nome: f.Name }))
      );
  }

  public obterLinhas(ficheiroId: string): Promise<ILinhaExcel[]> {
    return this._sp.web
      .getFileByServerRelativePath(ficheiroId)
      .getBuffer()
      .then((buffer: ArrayBuffer) => {
        const wb: XLSX.WorkBook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
        return lerLinhasExcel(wb, this._nomeSheet);
      });
  }
}
