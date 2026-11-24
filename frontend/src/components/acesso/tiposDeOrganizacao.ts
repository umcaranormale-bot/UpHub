import type { TipoOrganizacao } from '../../api/organizacoes'
import { ROTULO_TIPO_ORGANIZACAO, TIPOS_CANDIDATOS, TIPOS_PROVEDORES } from '../../estilos/formatos'

/**
 * Os 7 tipos de organização que dá para criar, nos dois grupos das telas 14 e 68:
 * empresa, startup e squad se candidatam (papel CANDIDATO); órgão de fomento,
 * investidor, aceleradora e empresa parceira oferecem (papel PROVEDOR).
 */

export type PapelDeQuemCadastra = 'CANDIDATO' | 'PROVEDOR'

export interface OpcaoDeTipo {
    tipo: TipoOrganizacao
    rotulo: string
    descricao: string
}

const DESCRICOES: Record<TipoOrganizacao, string> = {
    EMPRESA: 'Empresa estabelecida que concorre a editais de fomento.',
    STARTUP: 'Concorre a fomento e investimento. Tem descrição e deck.',
    SQUAD: 'Time da residência que concorre aos desafios de formação.',
    ORGAO_FOMENTO: 'Publica editais com recurso público.',
    INVESTIDOR: 'Publica rodadas com tese de investimento.',
    ACELERADORA: 'Publica programas de aceleração.',
    EMPRESA_PARCEIRA: 'Propõe desafios na residência.',
}

function opcao(tipo: TipoOrganizacao): OpcaoDeTipo {
    return { tipo, rotulo: ROTULO_TIPO_ORGANIZACAO[tipo], descricao: DESCRICOES[tipo] }
}

export const GRUPOS_DE_TIPO: { papel: PapelDeQuemCadastra; titulo: string; opcoes: OpcaoDeTipo[] }[] = [
    { papel: 'CANDIDATO', titulo: 'Para se candidatar · papel Candidato', opcoes: TIPOS_CANDIDATOS.map(opcao) },
    { papel: 'PROVEDOR', titulo: 'Para oferecer oportunidades · papel Provedor', opcoes: TIPOS_PROVEDORES.map(opcao) },
]

export function papelDoTipo(tipo: TipoOrganizacao): PapelDeQuemCadastra {
    return (TIPOS_PROVEDORES as readonly string[]).includes(tipo) ? 'PROVEDOR' : 'CANDIDATO'
}

export function ehTipo(valor: string | null): valor is TipoOrganizacao {
    return valor !== null && valor in DESCRICOES
}

// O tipo escolhido no cadastro (tela 14) vem marcado na tela 68, depois do primeiro login.
const CHAVE_TIPO = 'uphub.tipoEscolhido'

export function guardarTipoEscolhido(tipo: TipoOrganizacao) {
    try {
        localStorage.setItem(CHAVE_TIPO, tipo)
    } catch {
        // sem localStorage: a tela 68 só não vem com o tipo marcado
    }
}

export function lerTipoEscolhido(): TipoOrganizacao | null {
    try {
        const valor = localStorage.getItem(CHAVE_TIPO)
        return ehTipo(valor) ? valor : null
    } catch {
        return null
    }
}

export function esquecerTipoEscolhido() {
    try {
        localStorage.removeItem(CHAVE_TIPO)
    } catch {
        // nada a fazer
    }
}
