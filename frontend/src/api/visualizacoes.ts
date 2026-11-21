import { requisicao, type DataHora } from './cliente';

export interface Visualizacao {
    organizacaoId: number;
    organizacaoNome: string;
    primeiraEm: DataHora;
    ultimaEm: DataHora;
}

export function registrarVisualizacao(oportunidadeId: number, organizacaoId: number) {
    return requisicao<void>(`/api/oportunidades/${oportunidadeId}/visualizacoes`, {
        metodo: 'POST',
        corpo: { organizacaoId },
    });
}

export function listarVisualizacoes(oportunidadeId: number) {
    return requisicao<Visualizacao[]>(`/api/oportunidades/${oportunidadeId}/visualizacoes`);
}
