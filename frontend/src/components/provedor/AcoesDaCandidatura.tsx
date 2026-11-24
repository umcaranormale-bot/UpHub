import { useState } from 'react'

import { reabrirAjuste } from '../../api/ajustes'
import { conferirAutodeclaracao, type Autodeclaracao } from '../../api/autodeclaracoes'
import { decidirElegibilidade, iniciarAnalise, type Candidatura } from '../../api/candidaturas'
import { mensagemDeErro } from '../../api/erros'
import { buscarExtrato } from '../../api/extratoElegibilidade'
import { concluir, convocar, homologar, iniciarAcompanhamento, porNaListaDeEspera } from '../../api/resultado'
import { formatarData, hoje } from '../../estilos/formatos'
import useDados from '../../hooks/useDados'
import { CampoTexto } from '../ui/Campo'
import { Aviso, Carregando } from '../ui/Estados'
import Modal from '../ui/Modal'
import Botao, { BotaoLink } from './Botao'

/**
 * Os botões do provedor numa candidatura, conforme o estado (a máquina de
 * estados do back-end), com os modais de elegibilidade, reabrir prazo e
 * conferir a autodeclaração. Usado na lista e no extrato da candidatura.
 */
interface Props {
    candidatura: Candidatura
    nome: string
    /** Dias do prazo de ajuste da versão (para mostrar até quando vai o novo prazo). */
    prazoAjusteDias: number | null
    autodeclaracoes?: Autodeclaracao[]
    /** A primeira da lista de espera, para convocar quando a recusa libera a vaga. */
    primeiraDaLista?: { candidaturaId: number; nome: string } | null
    suspensa: boolean
    aoMudar: (mensagem: string) => Promise<void>
}

type Janela = 'elegibilidade' | 'reabrir' | 'autodeclaracao' | null

export function AcoesDaCandidatura({
    candidatura: c,
    nome,
    prazoAjusteDias,
    autodeclaracoes = [],
    primeiraDaLista = null,
    suspensa,
    aoMudar,
}: Props) {
    const [janela, setJanela] = useState<Janela>(null)
    const [ocupado, setOcupado] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    async function agir(acao: () => Promise<unknown>, mensagem: string) {
        setOcupado(true)
        setErro(null)
        try {
            await acao()
            setJanela(null)
            await aoMudar(mensagem)
        } catch (e) {
            setErro(mensagemDeErro(e))
        } finally {
            setOcupado(false)
        }
    }

    const declarada = autodeclaracoes.find((a) => a.situacao === 'DECLARADA') ?? null
    const podeMentor = c.estado === 'HOMOLOGADA' || c.estado === 'EM_ACOMPANHAMENTO'

    if (suspensa) {
        return <span className="text-legenda text-secundario">pausada</span>
    }

    return (
        <div className="flex flex-col items-start gap-2">
            <div className="flex flex-wrap gap-2">
                {c.estado === 'ENVIADA' && (
                    <Botao variante="primario" onClick={() => setJanela('elegibilidade')}>
                        Decidir elegibilidade
                    </Botao>
                )}
                {c.estado === 'ELEGIVEL' && (
                    <Botao
                        variante="primario"
                        disabled={ocupado}
                        onClick={() => void agir(() => iniciarAnalise(c.id), `${nome} entrou em análise. Agora atribua os avaliadores.`)}
                    >
                        Iniciar análise
                    </Botao>
                )}
                {c.estado === 'PERDA_DE_PRAZO' && <Botao onClick={() => setJanela('reabrir')}>Reabrir prazo</Botao>}
                {c.estado === 'APROVADA' && (
                    <>
                        <Botao
                            variante="primario"
                            disabled={ocupado}
                            onClick={() => void agir(() => homologar(c.id), `${nome} foi homologada.`)}
                        >
                            Homologar
                        </Botao>
                        <Botao
                            disabled={ocupado}
                            onClick={() => void agir(() => porNaListaDeEspera(c.id), `${nome} entrou na lista de espera.`)}
                        >
                            Lista de espera
                        </Botao>
                    </>
                )}
                {c.estado === 'HOMOLOGADA' && declarada && (
                    <Botao onClick={() => setJanela('autodeclaracao')}>Conferir autodeclaração</Botao>
                )}
                {c.estado === 'HOMOLOGADA' && (
                    <Botao
                        disabled={ocupado}
                        onClick={() => void agir(() => iniciarAcompanhamento(c.id), `${nome} entrou em acompanhamento.`)}
                    >
                        Iniciar acompanhamento
                    </Botao>
                )}
                {c.estado === 'EM_ACOMPANHAMENTO' && (
                    <Botao disabled={ocupado} onClick={() => void agir(() => concluir(c.id), `${nome} foi concluída.`)}>
                        Concluir
                    </Botao>
                )}
                {podeMentor && <BotaoLink para={`/provedor/candidaturas/${c.id}/mentor`}>Convidar mentor</BotaoLink>}
            </div>
            {erro && !janela && <p className="text-legenda text-status-reprovada-texto">{erro}</p>}

            {janela === 'elegibilidade' && (
                <ModalElegibilidade
                    candidatura={c}
                    nome={nome}
                    ocupado={ocupado}
                    erro={erro}
                    aoFechar={() => setJanela(null)}
                    aoDecidir={(elegivel) =>
                        void agir(
                            () => decidirElegibilidade(c.id, elegivel),
                            elegivel ? `${nome} foi considerada elegível.` : `${nome} foi considerada não elegível.`,
                        )
                    }
                />
            )}

            {janela === 'reabrir' && (
                <Modal
                    aberto
                    titulo={`Reabrir o prazo da ${nome}?`}
                    descricao={`A candidatura volta para “Ajuste pedido”, com os mesmos itens a corrigir. A ${nome} recebe o aviso.`}
                    aoFechar={() => setJanela(null)}
                    acoes={
                        <>
                            <Botao onClick={() => setJanela(null)}>Cancelar</Botao>
                            <Botao
                                variante="primario"
                                disabled={ocupado}
                                onClick={() => void agir(() => reabrirAjuste(c.id), `O prazo de ajuste da ${nome} foi reaberto.`)}
                            >
                                Reabrir prazo
                            </Botao>
                        </>
                    }
                >
                    <div className="rounded-card border border-sutil px-3 py-2">
                        <p className="text-apoio text-secundario">Novo prazo para reenvio</p>
                        <p className="text-item text-titulo">
                            {prazoAjusteDias
                                ? `${prazoAjusteDias} dias corridos · até ${formatarData(somarDias(hoje(), prazoAjusteDias))}`
                                : 'o prazo de ajuste da versão, contado a partir de agora'}
                        </p>
                    </div>
                    <p className="text-legenda text-secundario">A reabertura entra no histórico de auditoria com o seu nome e a data.</p>
                    {erro && <Aviso tipo="erro">{erro}</Aviso>}
                </Modal>
            )}

            {janela === 'autodeclaracao' && declarada && (
                <ModalAutodeclaracao
                    autodeclaracao={declarada}
                    nome={nome}
                    primeiraDaLista={primeiraDaLista}
                    ocupado={ocupado}
                    erro={erro}
                    aoFechar={() => setJanela(null)}
                    aoConfirmar={() =>
                        void agir(
                            () => conferirAutodeclaracao(c.id, declarada.criterio, { confirmada: true }),
                            `A autodeclaração da ${nome} (${declarada.criterio}) foi confirmada.`,
                        )
                    }
                    aoRecusar={(motivo, convocarProxima) =>
                        void agir(async () => {
                            await conferirAutodeclaracao(c.id, declarada.criterio, { confirmada: false, motivo })
                            if (convocarProxima && primeiraDaLista) await convocar(primeiraDaLista.candidaturaId)
                        }, `A autodeclaração da ${nome} foi recusada e a candidatura, desclassificada.${convocarProxima && primeiraDaLista ? ` ${primeiraDaLista.nome} foi convocada.` : ''}`)
                    }
                />
            )}
        </div>
    )
}

function somarDias(data: string, dias: number): string {
    const d = new Date(`${data}T12:00:00Z`)
    d.setUTCDate(d.getUTCDate() + dias)
    return d.toISOString().slice(0, 10)
}

function ModalElegibilidade({
    candidatura,
    nome,
    ocupado,
    erro,
    aoFechar,
    aoDecidir,
}: {
    candidatura: Candidatura
    nome: string
    ocupado: boolean
    erro: string | null
    aoFechar: () => void
    aoDecidir: (elegivel: boolean) => void
}) {
    const extrato = useDados(() => buscarExtrato(candidatura.id), [candidatura.id])
    return (
        <Modal
            aberto
            titulo={`Decidir a elegibilidade da ${nome}`}
            descricao="O motor de elegibilidade ficou pendente: faltou um dado da organização numa regra obrigatória. Confira e decida."
            aoFechar={aoFechar}
            acoes={
                <>
                    <Botao onClick={aoFechar}>Cancelar</Botao>
                    <Botao variante="perigo" disabled={ocupado} onClick={() => aoDecidir(false)}>
                        Não elegível
                    </Botao>
                    <Botao variante="primario" disabled={ocupado} onClick={() => aoDecidir(true)}>
                        Elegível
                    </Botao>
                </>
            }
        >
            {extrato.carregando && <Carregando texto="Buscando o extrato…" />}
            {extrato.dados && extrato.dados.faltou.length > 0 && (
                <div className="rounded-card bg-aviso-fundo p-4">
                    <p className="text-item text-ocre">O que faltou</p>
                    <ul className="mt-1 list-disc pl-5 text-apoio text-titulo">
                        {extrato.dados.faltou.map((f) => (
                            <li key={f}>{f}</li>
                        ))}
                    </ul>
                </div>
            )}
            {extrato.erro && <p className="text-apoio text-secundario">{extrato.erro}</p>}
            {erro && <Aviso tipo="erro">{erro}</Aviso>}
        </Modal>
    )
}

function ModalAutodeclaracao({
    autodeclaracao,
    nome,
    primeiraDaLista,
    ocupado,
    erro,
    aoFechar,
    aoConfirmar,
    aoRecusar,
}: {
    autodeclaracao: Autodeclaracao
    nome: string
    primeiraDaLista: { candidaturaId: number; nome: string } | null
    ocupado: boolean
    erro: string | null
    aoFechar: () => void
    aoConfirmar: () => void
    aoRecusar: (motivo: string, convocarProxima: boolean) => void
}) {
    const [motivo, setMotivo] = useState('')
    const [convocarProxima, setConvocarProxima] = useState(!!primeiraDaLista)

    return (
        <Modal
            aberto
            titulo={`Conferir a autodeclaração da ${nome}`}
            descricao={`A ${nome} ocupa uma vaga reservada (${autodeclaracao.criterio}), declarada em ${formatarData(autodeclaracao.declaradaEm)}. Se o documento não comprova a declaração, a candidatura é desclassificada. O avaliador nunca vê a autodeclaração.`}
            aoFechar={aoFechar}
            acoes={
                <>
                    <Botao onClick={aoFechar}>Não</Botao>
                    <Botao disabled={ocupado} onClick={aoConfirmar}>
                        Confirmar declaração
                    </Botao>
                    <Botao variante="perigo" disabled={ocupado || !motivo.trim()} onClick={() => aoRecusar(motivo.trim(), convocarProxima)}>
                        Sim, recusar
                    </Botao>
                </>
            }
        >
            <CampoTexto
                rotulo="Motivo da recusa (obrigatório para recusar)"
                rows={3}
                placeholder="Ex.: o documento não comprova a declaração"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
            />
            {primeiraDaLista && (
                <label className="flex items-start gap-2 text-apoio text-titulo">
                    <input
                        type="checkbox"
                        className="mt-1"
                        checked={convocarProxima}
                        onChange={(e) => setConvocarProxima(e.target.checked)}
                    />
                    <span>
                        Convocar a próxima da lista de espera
                        <span className="block text-legenda text-secundario">
                            {primeiraDaLista.nome}, 1ª da lista, é convocada para a vaga.
                        </span>
                    </span>
                </label>
            )}
            {erro && <Aviso tipo="erro">{erro}</Aviso>}
        </Modal>
    )
}

export default AcoesDaCandidatura
