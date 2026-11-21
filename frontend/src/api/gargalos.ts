import { requisicao, type DataHora } from './cliente';

export type EtapaGargalo = 'PUBLICACAO' | 'ELEGIBILIDADE' | 'AVALIACAO' | 'HOMOLOGACAO';

export interface ParametroGargalo {
    etapa: EtapaGargalo;
    limiteDiasUteis: number;
}

export interface ItemParado {
    oportunidadeId: number | null;
    oportunidadeTitulo: string | null;
    candidaturaId: number | null;
    solicitacaoProvedorId: number | null;
    organizacaoNome: string;
    responsavel: { pessoaId: number | null; nome: string; papel: 'PROVEDOR' | 'AVALIADOR' | 'GESTAO' };
    semAvaliador: boolean;
    paradoDesde: DataHora;
    diasUteis: number;
}

export interface GargaloEtapa {
    etapa: EtapaGargalo;
    limiteDiasUteis: number;
    acimaDoLimite: number;
    maisAntigoDiasUteis: number | null;
    itens: ItemParado[];
}

export function listarGargalos(etapa?: EtapaGargalo) {
    return requisicao<GargaloEtapa[]>('/api/gargalos', { parametros: { etapa } });
}

export function listarParametrosDeGargalo() {
    return requisicao<ParametroGargalo[]>('/api/gargalos/parametros');
}

export function editarParametroDeGargalo(etapa: EtapaGargalo, limiteDiasUteis: number) {
    return requisicao<ParametroGargalo>(`/api/gargalos/parametros/${etapa}`, { metodo: 'PUT', corpo: { limiteDiasUteis } });
}