import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  IPropertyPaneDropdownOption,
  PropertyPaneDropdown,
  PropertyPaneSlider,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import DashboardCadeias from './components/DashboardCadeias';
import { IDashboardCadeiasProps } from './components/IDashboardCadeiasProps';
import { IConfigDashboard } from './models/IModelos';
import { IJobDataService } from './services/IJobDataService';
import { MockJobDataService } from './services/MockJobDataService';
import { SharePointExcelService } from './services/SharePointExcelService';
import { CONFIG_PADRAO } from './utils/config';

export interface IDashboardCadeiasWebPartProps {
  /** 'mock' | 'sharepoint' */
  fonteDados: string;
  /** ServerRelativeUrl da pasta com os Excel, ex. /sites/Operacoes/Shared Documents/Jobs */
  pastaBiblioteca: string;
  nomeSheet: string;
  /** Lista separada por vírgulas, ex. INST01,INST02,... */
  instancias: string;
  janelaHabitual: number;
  limiarAtraso: number;
  limiarCritico: number;
  atualizarMin: number;
}

const FONTES: IPropertyPaneDropdownOption[] = [
  { key: 'mock', text: 'Dados fictícios (protótipo)' },
  { key: 'sharepoint', text: 'Excel na biblioteca SharePoint' }
];

export default class DashboardCadeiasWebPart extends BaseClientSideWebPart<IDashboardCadeiasWebPartProps> {
  private _servico: IJobDataService | undefined;
  private _chaveServico = '';

  public render(): void {
    const config: IConfigDashboard = this._config();
    const element: React.ReactElement<IDashboardCadeiasProps> = React.createElement(DashboardCadeias, {
      servico: this._obterServico(config),
      config,
      atualizarMin: this.properties.atualizarMin || 0
    });
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  /** Só cria um novo serviço quando a fonte muda, para não recarregar a cada render. */
  private _obterServico(config: IConfigDashboard): IJobDataService {
    const p: IDashboardCadeiasWebPartProps = this.properties;
    const chave: string = [p.fonteDados, p.pastaBiblioteca, p.nomeSheet, config.instancias.join(',')].join('|');
    if (!this._servico || chave !== this._chaveServico) {
      this._chaveServico = chave;
      this._servico = p.fonteDados === 'sharepoint' && p.pastaBiblioteca
        ? new SharePointExcelService(this.context, p.pastaBiblioteca, p.nomeSheet || undefined)
        : new MockJobDataService(config);
    }
    return this._servico;
  }

  private _config(): IConfigDashboard {
    const p: IDashboardCadeiasWebPartProps = this.properties;
    const instancias: string[] = (p.instancias || '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => !!s);
    return {
      instancias: instancias.length ? instancias : CONFIG_PADRAO.instancias,
      cadeias: CONFIG_PADRAO.cadeias,
      janelaHabitual: p.janelaHabitual || CONFIG_PADRAO.janelaHabitual,
      limiarAtraso: p.limiarAtraso || CONFIG_PADRAO.limiarAtraso,
      limiarCritico: p.limiarCritico || CONFIG_PADRAO.limiarCritico
    };
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Configuração do dashboard de cadeias mainframe' },
          groups: [
            {
              groupName: 'Fonte de dados',
              groupFields: [
                PropertyPaneDropdown('fonteDados', { label: 'Fonte', options: FONTES }),
                PropertyPaneTextField('pastaBiblioteca', {
                  label: 'Pasta da biblioteca (server relative)',
                  placeholder: '/sites/Operacoes/Shared Documents/Jobs',
                  disabled: this.properties.fonteDados !== 'sharepoint'
                }),
                PropertyPaneTextField('nomeSheet', {
                  label: 'Nome da sheet (vazio = primeira)',
                  disabled: this.properties.fonteDados !== 'sharepoint'
                }),
                PropertyPaneSlider('atualizarMin', { label: 'Atualizar automaticamente (min, 0 = não)', min: 0, max: 30, step: 1 })
              ]
            },
            {
              groupName: 'Regras',
              groupFields: [
                PropertyPaneTextField('instancias', { label: 'Instâncias (separadas por vírgula)' }),
                PropertyPaneSlider('janelaHabitual', { label: 'Dias para a hora habitual', min: 3, max: 30, step: 1 }),
                PropertyPaneSlider('limiarAtraso', { label: 'Atraso a partir de (min)', min: 5, max: 60, step: 5 }),
                PropertyPaneSlider('limiarCritico', { label: 'Muito atrasada / não arrancou a partir de (min)', min: 10, max: 120, step: 5 })
              ]
            }
          ]
        }
      ]
    };
  }
}
