import type { ItemDeMenu } from '../components/CascaDoApp'

/**
 * Menus laterais por papel, como estão no protótipo do Figma.
 *
 * Ficam em um arquivo só porque o mesmo menu aparece em todas as telas de um
 * papel: mudar um rótulo ou uma rota aqui muda em todas de uma vez.
 *
 * "Conta" tem uma rota por papel porque o protótipo desenha uma tela de conta
 * para cada um (57, 59, 60 e 61), com conteúdo diferente no miolo.
 */

export const MENU_SQUAD: ItemDeMenu[] = [
    { rotulo: 'Início', para: '/inicio/squad' },
    { rotulo: 'Oportunidades', para: '/oportunidades' },
    { rotulo: 'Minhas candidaturas', para: '/candidaturas' },
    { rotulo: 'Perfil da squad', para: '/organizacao' },
    { rotulo: 'Conta', para: '/conta/squad' },
]

export const MENU_MENTOR: ItemDeMenu[] = [
    { rotulo: 'Início', para: '/mentor' },
    { rotulo: 'Convites', para: '/convites' },
    { rotulo: 'Acompanhados', para: '/acompanhados' },
    { rotulo: 'Horas doadas', para: '/horas' },
    { rotulo: 'Conta', para: '/conta/mentor' },
]

export const MENU_AVALIADOR: ItemDeMenu[] = [
    { rotulo: 'Fila de avaliação', para: '/avaliacao' },
    { rotulo: 'Conta', para: '/conta/avaliador' },
]

export const MENU_GESTAO: ItemDeMenu[] = [
    { rotulo: 'Painel do ecossistema', para: '/painel' },
    { rotulo: 'Aprovação de provedores', para: '/provedores' },
    { rotulo: 'Alocação de mentores', para: '/alocacao' },
    { rotulo: 'Conta', para: '/conta/gestao' },
]
