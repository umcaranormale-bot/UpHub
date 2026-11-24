import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { buscarCandidatura } from '../api/candidaturas'
import { mensagemDeErro } from '../api/erros'
import { convidarMentor, listarMentores, listarMentoresDaCandidatura, type Alocacao, type Mentor } from '../api/mentoria'
import { buscarOportunidade } from '../api/oportunidades'
import CascaDoApp from '../components/CascaDoApp'
import SeloStatus, { type Status } from '../components/SeloStatus'
import Botao from '../components/provedor/Botao'
import Cabecalho, { Bloco } from '../components/provedor/Cabecalho'
import { nomeDaOrganizacao } from '../components/provedor/dados'
import Tabela, { Celula, Linha } from '../components/provedor/Tabela'
import { Campo } from '../components/ui/Campo'
import { Aviso, Carregando, ErroNaTela } from '../components/ui/Estados'
import { formatarData, hoje, rotuloDoEstado } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_PROVEDOR } from '../navegacao/menus'

/** 74 · Provedor — convidar mentor (área e horas livres) · rota /provedor/candidaturas/:id/mentor */

const SITUACAO: Record<Alocacao['situacao'], { rotulo: string; status: Status }> = {
    PENDENTE: { rotulo: 'Aguardando resposta', status: 'pendente' },
    ACEITA: { rotulo: 'Aceito', status: 'aprovada' },
    RECUSADA: { rotulo: 'Recusado', status: 'reprovada' },
    EXPIRADA: { rotulo: 'Expirado', status: 'rascunho' },
}

function ProvedorConvidarMentor() {
    const { id } = useParams()
    const candidaturaId = Number(id)
    const [area, setArea] = useState('')
    const [busca, setBusca] = useState('')
    const [escolhido, setEscolhido] = useState<Mentor | null>(null)
    const [horas, setHoras] = useState('')
    const [prazo, setPrazo] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [aviso, setAviso] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

    const base = useDados(
        async () => {
            const candidatura = await buscarCandidatura(candidaturaId)
            const [oportunidade, nome, convites] = await Promise.all([
                buscarOportunidade(candidatura.oportunidadeId),
                nomeDaOrganizacao(candidatura.organizacaoId),
                listarMentoresDaCandidatura(candidaturaId),
            ])
            return { candidatura, oportunidade, nome, convites }
        },
        [candidaturaId],
    )
    const organizacaoId = base.dados?.oportunidade.organizacaoId
    const mentores = useDados(() => listarMentores(organizacaoId!, busca || undefined), [organizacaoId, busca], !!organizacaoId)

    const convites = base.dados?.convites ?? []
    const jaConvidado = (m: Mentor) => convites.some((c) => c.vinculoId === m.vinculoId && (c.situacao === 'PENDENTE' || c.situacao === 'ACEITA'))
    const podeReceber = base.dados && ['HOMOLOGADA', 'EM_ACOMPANHAMENTO'].includes(base.dados.candidatura.estado)

    async function enviar() {
        if (!escolhido) return
        setEnviando(true)
        setAviso(null)
        try {
            await convidarMentor(candidaturaId, { vinculoId: escolhido.vinculoId, horasPrevistasMes: Number(horas), prazoResposta: prazo })
            setAviso({ tipo: 'sucesso', texto: `Convite enviado para ${escolhido.nome}. Sem resposta até ${formatarData(prazo)}, ele expira sozinho.` })
            setEscolhido(null)
            setHoras('')
            setPrazo('')
            await Promise.all([base.recarregar(), mentores.recarregar()])
        } catch (e) {
            setAviso({ tipo: 'erro', texto: mensagemDeErro(e) })
        } finally {
            setEnviando(false)
        }
    }

    const opId = base.dados?.candidatura.oportunidadeId

    return (
        <CascaDoApp itens={MENU_PROVEDOR} voltarPara={opId ? `/provedor/oportunidades/${opId}/vagas` : '/provedor/candidaturas'}>
            <Cabecalho
                titulo={`Convidar mentor · ${base.dados?.nome ?? ''}`}
                apoio={
                    base.dados
                        ? `${rotuloDoEstado(base.dados.candidatura.estado)} em ${base.dados.oportunidade.titulo} · o mentor precisa ter vínculo de mentor na sua organização`
                        : undefined
                }
            />

            <div className="mt-6 flex flex-col gap-5">
                {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}
                {base.carregando && !base.dados && <Carregando />}
                {base.erro && <ErroNaTela mensagem={base.erro} tentarDeNovo={() => void base.recarregar()} />}

                {base.dados && !podeReceber && (
                    <Aviso tipo="erro">
                        Só a candidatura homologada ou em acompanhamento recebe mentor. Esta está em “
                        {rotuloDoEstado(base.dados.candidatura.estado)}”.
                    </Aviso>
                )}

                {base.dados && (
                    <Bloco titulo="Mentores disponíveis" apoio="Os com mais horas livres no mês aparecem primeiro.">
                        <form
                            className="flex items-end gap-3"
                            onSubmit={(e) => {
                                e.preventDefault()
                                setBusca(area.trim())
                            }}
                        >
                            <div className="w-80">
                                <Campo rotulo="Área de atuação" value={area} placeholder="Ex.: dados" onChange={(e) => setArea(e.target.value)} />
                            </div>
                            <Botao type="submit" className="h-[42px]">
                                Buscar
                            </Botao>
                        </form>

                        <div className="mt-4">
                            {mentores.carregando && !mentores.dados && <Carregando />}
                            {mentores.erro && <ErroNaTela mensagem={mentores.erro} tentarDeNovo={() => void mentores.recarregar()} />}
                            {mentores.dados && mentores.dados.length === 0 && (
                                <p className="text-apoio text-secundario">
                                    Nenhum mentor {busca ? `na área “${busca}”` : 'com vínculo na organização'}. Convide mentores em Avaliadores › Convidar.
                                </p>
                            )}
                            {mentores.dados && mentores.dados.length > 0 && (
                                <Tabela rotulo="Mentores" colunas={['Mentor', 'Área de atuação', 'Horas livres no mês', 'Já alocadas', '']} semMoldura>
                                    {mentores.dados.map((m) => {
                                        const semHoras = m.horasLivresMes !== null && m.horasLivresMes <= 0
                                        return (
                                            <Linha key={m.vinculoId} destaque={escolhido?.vinculoId === m.vinculoId}>
                                                <Celula forte>{m.nome}</Celula>
                                                <Celula>{m.areaAtuacao ?? '—'}</Celula>
                                                <Celula>
                                                    {m.horasLivresMes === null ? 'sem limite' : `${m.horasLivresMes} de ${m.horasDisponiveisMes ?? '—'}`}
                                                </Celula>
                                                <Celula>{m.horasComprometidasMes}</Celula>
                                                <Celula>
                                                    {jaConvidado(m) ? (
                                                        <SeloStatus status="rascunho" rotulo="Já convidado" comPonto />
                                                    ) : semHoras ? (
                                                        <SeloStatus status="pendente" rotulo="Sem horas livres" comPonto />
                                                    ) : (
                                                        podeReceber && (
                                                            <Botao
                                                                onClick={() => {
                                                                    setEscolhido(m)
                                                                    setAviso(null)
                                                                }}
                                                            >
                                                                Convidar
                                                            </Botao>
                                                        )
                                                    )}
                                                </Celula>
                                            </Linha>
                                        )
                                    })}
                                </Tabela>
                            )}
                        </div>
                    </Bloco>
                )}

                {escolhido && (
                    <Bloco titulo={`Convite para ${escolhido.nome}`}>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                void enviar()
                            }}
                        >
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Campo
                                    rotulo="Horas previstas por mês"
                                    type="number"
                                    min={1}
                                    max={escolhido.horasLivresMes ?? undefined}
                                    required
                                    value={horas}
                                    onChange={(e) => setHoras(e.target.value)}
                                    ajuda="Não pode passar das horas livres do mentor."
                                />
                                <Campo
                                    rotulo="Prazo para responder"
                                    type="date"
                                    min={hoje()}
                                    required
                                    value={prazo}
                                    onChange={(e) => setPrazo(e.target.value)}
                                    ajuda="Sem resposta até o prazo, o convite expira sozinho."
                                />
                            </div>
                            <div className="mt-4 flex gap-3">
                                <Botao type="submit" variante="primario" disabled={enviando || !horas || !prazo}>
                                    {enviando ? 'Enviando…' : 'Enviar convite'}
                                </Botao>
                                <Botao onClick={() => setEscolhido(null)}>Cancelar</Botao>
                            </div>
                        </form>
                    </Bloco>
                )}

                {base.dados && (
                    <Bloco titulo="Convites desta candidatura">
                        {convites.length === 0 ? (
                            <p className="text-apoio text-secundario">Nenhum mentor convidado ainda.</p>
                        ) : (
                            <Tabela rotulo="Convites de mentoria" colunas={['Mentor', 'Horas por mês', 'Prazo', 'Situação']} semMoldura>
                                {convites.map((c) => (
                                    <Linha key={c.id}>
                                        <Celula forte>{c.mentorNome}</Celula>
                                        <Celula>{c.horasPrevistasMes}</Celula>
                                        <Celula>{formatarData(c.prazoResposta)}</Celula>
                                        <Celula>
                                            <SeloStatus status={SITUACAO[c.situacao].status} rotulo={SITUACAO[c.situacao].rotulo} comPonto />
                                        </Celula>
                                    </Linha>
                                ))}
                            </Tabela>
                        )}
                    </Bloco>
                )}

                <p className="rounded-card bg-page px-5 py-3 text-apoio text-secundario">
                    Conflito de interesse: quem faz parte da organização candidata não pode ser convidado como mentor dela.
                </p>
            </div>
        </CascaDoApp>
    )
}

export default ProvedorConvidarMentor
