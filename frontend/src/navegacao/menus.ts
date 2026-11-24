import type { ItemDeMenu } from '../components/MenuLateral'

/**
 * Menus laterais por papel, como estão no protótipo do Figma.
 *
 * Ficam em um arquivo só porque o mesmo menu aparece em todas as telas de um
 * papel: mudar um rótulo ou uma rota aqui muda em todas de uma vez.
 *
 * As rotas são prefixadas pelo papel. "Oportunidades", "Candidaturas" e
 * "Conta" existem em mais de um papel com conteúdo diferente, então um
 * caminho genérico como /oportunidades levaria quem está na área do provedor
 * para a tela da squad.
 *
 * Item sem "para" é uma tela que ainda não existe: o menu mostra o rótulo,
 * mas não deixa clicar, em vez de mandar o usuário para a landing page.
 */

export const MENU_SQUAD: ItemDeMenu[] = [
    { rotulo: 'Início', para: '/squad' },
    { rotulo: 'Oportunidades', para: '/squad/oportunidades' },
    { rotulo: 'Minhas candidaturas', para: '/squad/candidaturas' },
    { rotulo: 'Perfil da squad', para: '/squad/perfil' },
    { rotulo: 'Conta', para: '/squad/conta' },
]

export const MENU_MENTOR: ItemDeMenu[] = [
    { rotulo: 'Início', para: '/mentor' },
    { rotulo: 'Convites', para: '/mentor/convites' },
    { rotulo: 'Acompanhados', para: '/mentor/acompanhados' },
    { rotulo: 'Horas doadas', para: '/mentor/horas' },
    { rotulo: 'Conta', para: '/mentor/conta' },
]

export const MENU_AVALIADOR: ItemDeMenu[] = [
    { rotulo: 'Fila de avaliação', para: '/avaliador' },
    { rotulo: 'Conta', para: '/avaliador/conta' },
]

export const MENU_GESTAO: ItemDeMenu[] = [
    { rotulo: 'Painel do ecossistema', para: '/gestao' },
    { rotulo: 'Aprovação de provedores', para: '/gestao/provedores' },
    { rotulo: 'Alocação de mentores', para: '/gestao/alocacao' },
    { rotulo: 'Residências', para: '/gestao/residencias' },
    { rotulo: 'Conta', para: '/gestao/conta' },
]

export const MENU_CANDIDATO: ItemDeMenu[] = [
    { rotulo: 'Início', para: '/candidato' },
    { rotulo: 'Oportunidades', para: '/candidato/oportunidades' },
    { rotulo: 'Minhas candidaturas', para: '/candidato/candidaturas' },
    { rotulo: 'Perfil da organização', para: '/candidato/organizacao' },
    { rotulo: 'Conta', para: '/candidato/conta' },
]

export const MENU_PROVEDOR: ItemDeMenu[] = [
    { rotulo: 'Painel', para: '/provedor' },
    { rotulo: 'Candidaturas', para: '/provedor/candidaturas' },
    { rotulo: 'Avaliadores', para: '/provedor/avaliadores' },
    { rotulo: 'Pedido de publicação', para: '/provedor/pedido' },
    { rotulo: 'Notificações e prazos', para: '/provedor/notificacoes' },
    { rotulo: 'Histórico de auditoria', para: '/provedor/auditoria' },
    { rotulo: 'Conta', para: '/provedor/conta' },
]
