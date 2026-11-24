import type { Papel } from '../api/vinculos'
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
    { rotulo: 'Conta', para: '/gestao/conta' },
]

/**
 * Menu do HomeLayout, herdado do antigo SideMenu. Os rótulos são os que
 * estavam lá. Nenhuma dessas telas foi implementada, então todas ficam sem
 * "para": aparecem no menu, mas não levam à landing page por engano.
 */
export const MENU_HOME: ItemDeMenu[] = [
    { rotulo: 'Painel' },
    { rotulo: 'Oportunidades' },
    { rotulo: 'Candidaturas' },
    { rotulo: 'Avaliadores' },
    { rotulo: 'Notificações e prazos' },
    { rotulo: 'Histórico de auditoria' },
    { rotulo: 'Conta' },
]
/**
 * Área do provedor: as telas ainda não existem. Os rótulos vêm do comentário
 * acima (Oportunidades, Candidaturas e Conta também existem no provedor).
 * Sem "para", aparecem no menu mas não deixam clicar.
 */
export const MENU_PROVEDOR: ItemDeMenu[] = [
    { rotulo: 'Oportunidades' },
    { rotulo: 'Candidaturas' },
    { rotulo: 'Conta' },
]

/** Menu de cada papel, usado pelo AppLayout. */
export const MENUS_POR_PAPEL: Record<Papel, ItemDeMenu[]> = {
    PROVEDOR: MENU_PROVEDOR,
    CANDIDATO: MENU_SQUAD,
    AVALIADOR: MENU_AVALIADOR,
    MENTOR: MENU_MENTOR,
    GESTAO: MENU_GESTAO,
}