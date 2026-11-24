import type { Papel } from '../api/vinculos'

export const ROTULO_DO_PAPEL: Record<Papel, string> = {
    PROVEDOR: 'Provedor',
    CANDIDATO: 'Candidato · squad',
    AVALIADOR: 'Avaliador',
    MENTOR: 'Mentor',
    GESTAO: 'Gestão',
}