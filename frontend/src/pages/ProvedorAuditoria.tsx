import { useId, useState } from 'react'
import { Link } from 'react-router-dom'

import { historicoDaOportunidade, type EventoAuditoria } from '../api/auditoria'
import CascaDoApp from '../components/CascaDoApp'
import Cabecalho from '../components/provedor/Cabecalho'
import { LINK_ACAO } from '../components/provedor/rotulos'
import SeletorDeOportunidade from '../components/provedor/SeletorDeOportunidade'
import Tabela, { Celula, Linha } from '../components/provedor/Tabela'
import useOportunidadeEscolhida from '../components/provedor/useOportunidadeEscolhida'
import { Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { diasAte, formatarDataHora, rotuloDoEstado } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_PROVEDOR } from '../navegacao/menus'
import { useSessao } from '../sessao/contexto'

/** 30 · Provedor — histórico de auditoria da oportunidade · rota /provedor/auditoria?oportunidade=12 */

const ENTIDADE: Record<EventoAuditoria['entidadeTipo'], string> = {
    CANDIDATURA: 'Candidatura',
    OPORTUNIDADE: 'Oportunidade',
    VERSAO: 'Versão',
    SOLICITACAO_PROVEDOR: 'Pedido de provedor',
    PEDIDO_AJUSTE: 'Pedido de ajuste',
    ALOCACAO_MENTOR: 'Alocação de mentor',
}

const PAPEL: Record<string, string> = {
    PROVEDOR: 'Provedor',
    CANDIDATO: 'Candidato',
    AVALIADOR: 'Avaliador',
    MENTOR: 'Mentor',
    GESTAO: 'Gestão do PD',
}

const PERIODOS = { TUDO: 'Tudo', '7': 'Últimos 7 dias', '30': 'Últimos 30 dias', '90': 'Últimos 90 dias' } as const
type Periodo = keyof typeof PERIODOS
type FiltroAutor = 'TODOS' | 'PESSOAS' | 'SISTEMA'

function rotuloDoEstadoDe(ev: EventoAuditoria, estado: string): string {
    if (ev.entidadeTipo === 'CANDIDATURA') return rotuloDoEstado(estado)
    return estado.charAt(0) + estado.slice(1).toLowerCase().replace(/_/g, ' ')
}

function textoDaAcao(acao: string): string {
    const texto = acao.replace(/_/g, ' ').toLowerCase()
    return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function autorDe(ev: EventoAuditoria): string {
    if (ev.autorSistema === 'AGENDADOR') return 'Agendador (automático)'
    if (ev.autorSistema === 'SISTEMA') return 'Sistema'
    return ev.autor?.nome ?? '—'
}

function ProvedorAuditoria() {
    const { perfilAtivo } = useSessao()
    const escolha = useOportunidadeEscolhida(true)
    const op = escolha.escolhida
    const [periodo, setPeriodo] = useState<Periodo>('TUDO')
    const [autor, setAutor] = useState<FiltroAutor>('TODOS')
    const idPeriodo = useId()
    const idAutor = useId()

    const { dados, carregando, erro, recarregar } = useDados(() => historicoDaOportunidade(op!.id), [op?.id], !!op)

    const eventos = [...(dados ?? [])]
        .filter((ev) => periodo === 'TUDO' || diasAte(ev.ocorridoEm.slice(0, 10)) >= -Number(periodo))
        .filter((ev) => autor === 'TODOS' || (autor === 'SISTEMA' ? !!ev.autorSistema : !ev.autorSistema))
        .sort((a, b) => b.ocorridoEm.localeCompare(a.ocorridoEm))

    return (
        <CascaDoApp itens={MENU_PROVEDOR}>
            <Cabecalho
                titulo="Histórico de auditoria"
                apoio={`Toda mudança de estado nas oportunidades de ${perfilAtivo?.vinculo.organizacaoNome ?? 'sua organização'}, com autor, papel, data e justificativa. O registro não pode ser editado nem apagado.`}
            />

            <div className="mt-5 flex flex-wrap items-center gap-3">
                {escolha.oportunidades.length > 0 && (
                    <SeletorDeOportunidade oportunidades={escolha.oportunidades} escolhida={op} aoEscolher={escolha.escolher} />
                )}
                <div className="flex items-center gap-2 rounded-card border border-sutil bg-card px-3 py-2">
                    <label htmlFor={idPeriodo} className="text-apoio text-secundario">
                        Período
                    </label>
                    <select
                        id={idPeriodo}
                        value={periodo}
                        onChange={(e) => setPeriodo(e.target.value as Periodo)}
                        className="bg-transparent text-item text-titulo outline-none"
                    >
                        {Object.entries(PERIODOS).map(([valor, rotulo]) => (
                            <option key={valor} value={valor}>
                                {rotulo}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2 rounded-card border border-sutil bg-card px-3 py-2">
                    <label htmlFor={idAutor} className="text-apoio text-secundario">
                        Autor
                    </label>
                    <select
                        id={idAutor}
                        value={autor}
                        onChange={(e) => setAutor(e.target.value as FiltroAutor)}
                        className="bg-transparent text-item text-titulo outline-none"
                    >
                        <option value="TODOS">Todos</option>
                        <option value="PESSOAS">Só pessoas</option>
                        <option value="SISTEMA">Só ações automáticas</option>
                    </select>
                </div>
            </div>

            <div className="mt-5 flex flex-col gap-5">
                {escolha.carregando && !escolha.dados && <Carregando />}
                {escolha.erro && <ErroNaTela mensagem={escolha.erro} tentarDeNovo={() => void escolha.recarregar()} />}
                {escolha.dados && escolha.oportunidades.length === 0 && (
                    <Vazio titulo="Nenhuma oportunidade ainda">
                        O histórico começa quando a organização cria a primeira oportunidade.{' '}
                        <Link to="/provedor/oportunidades/nova" className={LINK_ACAO}>
                            Criar oportunidade
                        </Link>
                    </Vazio>
                )}

                {op && carregando && !dados && <Carregando />}
                {op && erro && <ErroNaTela mensagem={erro} tentarDeNovo={() => void recarregar()} />}
                {dados && eventos.length === 0 && <Vazio titulo="Nenhum evento neste filtro" />}

                {dados && eventos.length > 0 && (
                    <Tabela rotulo={`Histórico de ${op?.titulo ?? ''}`} colunas={['Data e hora', 'Autor', 'Papel', 'Ação', 'Justificativa']}>
                        {eventos.map((ev) => (
                            <Linha key={ev.id}>
                                <Celula>{formatarDataHora(ev.ocorridoEm)}</Celula>
                                <Celula>{autorDe(ev)}</Celula>
                                <Celula>{ev.autorSistema ? 'Automático' : ev.papel ? (PAPEL[ev.papel] ?? ev.papel) : '—'}</Celula>
                                <Celula forte>
                                    {ENTIDADE[ev.entidadeTipo] ?? ev.entidadeTipo}
                                    {ev.candidaturaId && ev.entidadeTipo !== 'OPORTUNIDADE' ? (
                                        <>
                                            {' '}
                                            <Link to={`/provedor/candidaturas/${ev.candidaturaId}`} className={LINK_ACAO}>
                                                #{ev.candidaturaId}
                                            </Link>
                                        </>
                                    ) : null}
                                    {': '}
                                    {ev.estadoAnterior || ev.estadoNovo ? (
                                        <>
                                            {ev.estadoAnterior ? rotuloDoEstadoDe(ev, ev.estadoAnterior) : '—'} →{' '}
                                            {ev.estadoNovo ? rotuloDoEstadoDe(ev, ev.estadoNovo) : '—'}
                                        </>
                                    ) : (
                                        textoDaAcao(ev.acao)
                                    )}
                                </Celula>
                                <Celula>{ev.justificativa ?? '—'}</Celula>
                            </Linha>
                        ))}
                    </Tabela>
                )}
            </div>
        </CascaDoApp>
    )
}

export default ProvedorAuditoria
