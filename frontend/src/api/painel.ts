import { requisicao, type DataHora } from './cliente';
import type { EtapaGargalo } from './gargalos';

export interface TrilhaNoPainel {
    trilhaCodigo: 'FOMENTO' | 'INVESTIMENTO' | 'FORMACAO' | 'TODAS';
    oportunidadesAtivas: number;
    oportunidadesPausadas: number;
    candidaturasEnviadas: number;
    aprovadas: number;
    taxaDeConexao: number;
    emAcompanhamento: number;
    concluidas: number;
}

export interface ResumoGargalo {
    etapa: EtapaGargalo;
    limiteDiasUteis: number;
    acimaDoLimite: number;
    maisAntigoDiasUteis: number | null;
}

export interface Painel {
    geradoEm: DataHora;
    total: TrilhaNoPainel;
    trilhas: TrilhaNoPainel[];
    candidaturasPorEstado: Record<string, number>;
    funilInvestimento: Record<'INSCRITA' | 'TRIADA' | 'EM_DILIGENCIA' | 'SELECIONADA', number>;
    organizacoesPorTipo: Record<string, number>;
    residencias: { abertas: number; encerradas: number; squadsNasAbertas: number; desafiosNasAbertas: number };
    avaliacao: { aguardandoAssinatura: number; assinadas: number; pedidosDeAjusteAbertos: number };
    mentoria: { alocacoesAceitas: number; horasPrevistasMes: number; horasRealizadasMes: number; sessoesAssinadasMes: number };
    gargalos: ResumoGargalo[];
}

export function buscarPainel() {
    return requisicao<Painel>('/api/painel');
}