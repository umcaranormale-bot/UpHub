import { useState } from 'react'
import { Link } from 'react-router-dom'

import { listarAutodeclaracoes, type Autodeclaracao } from '../api/autodeclaracoes'
import { listarCandidaturasDaOportunidade, type Candidatura, type EstadoCandidatura } from '../api/candidaturas'
import { mensagemDeErro } from '../api/erros'
import { matchingDaOportunidade } from '../api/matching'
import { homologar, porNaListaDeEspera, resumoDasVagas, type Vagas } from '../api/resultado'
import { listarVersoes } from '../api/versoes'
import AbasDeFiltro, { type Aba } from '../components/AbasDeFiltro'
import CascaDoApp from '../components/CascaDoApp'
import Indicadores from '../components/Indicadores'
import SeloStatus from '../components/SeloStatus'
import AcoesDaCandidatura from '../components/provedor/AcoesDaCandidatura'
import Botao from '../components/provedor/Botao'
import Cabecalho from '../components/provedor/Cabecalho'
import { avaliacoesDe, formatarNota, nomesDasOrganizacoes, notaFinal, rodadaAtual, versaoEmVigor } from '../components/provedor/dados'
import { APROVADAS, DECIDIDAS, elegibilidadeDoEstado, estaSuspensa, LINK_ACAO, NA_AVALIACAO } from '../components/provedor/rotulos'
import SeletorDeOportunidade from '../components/provedor/SeletorDeOportunidade'
import Tabela, { Celula, Linha } from '../components/provedor/Tabela'
import useOportunidadeEscolhida from '../components/provedor/useOportunidadeEscolhida'
import { Aviso, Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import Modal from '../components/ui/Modal'
import { formatarData, rotuloDoEstado, statusDoEstado } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_PROVEDOR } from '../navegacao/menus'

/**
 * 27 · Provedor — candidaturas recebidas · rota /provedor/candidaturas?oportunidade=12
 *
 * As candidaturas de uma oportunidade, com a decisão de elegibilidade das
 * pendentes e os modais Homologar resultado, Reabrir prazo e Recusar
 * autodeclaração (vaga reservada).
 */

type Filtro = 'TODAS' | 'PENDENTES' | 'ANALISE' | 'APROVADAS' | 'FORA'

const GRUPO: Record<Exclude<Filtro, 'TODAS'>, EstadoCandidatura[]> = {
    PENDENTES: ['ENVIADA'],
    ANALISE: ['ELEGIVEL', 'EM_ANALISE', 'AJUSTE', 'PERDA_DE_PRAZO'],
    APROVADAS,
    FORA: ['NAO_ELEGIVEL', 'REPROVADA', 'DESCARTADA'],
}

function ProvedorCandidaturas() {
    const escolha = useOportunidadeEscolhida()
    const op = escolha.escolhida

    const { dados, carregando, erro, recarregar } = useDados(
        async () => {
            const candidaturas = await listarCandidaturasDaOportunidade(op!.id)
            const [nomes, avaliacoes, matching, versoes, vagas] = await Promise.all([
                nomesDasOrganizacoes(candidaturas.map((c) => c.organizacaoId)),
                avaliacoesDe(candidaturas),
                matchingDaOportunidade(op!.id, 100).catch(() => []),
                listarVersoes(op!.id).catch(() => []),
                resumoDasVagas(op!.id).catch(() => null as Vagas | null),
            ])
            const homologadas = candidaturas.filter((c) => c.estado === 'HOMOLOGADA')
            const declaracoes = new Map<number, Autodeclaracao[]>(
                await Promise.all(
                    homologadas.map(
                        async (c) => [c.id, await listarAutodeclaracoes(c.id).catch(() => [] as Autodeclaracao[])] as const,
                    ),
                ),
            )
            const compatibilidade = new Map(matching.map((m) => [m.organizacaoId, m.compatibilidade]))
            return { candidaturas, nomes, avaliacoes, compatibilidade, versao: versaoEmVigor(versoes), vagas, declaracoes }
        },
        [op?.id],
        !!op,
    )

    const [filtro, setFiltro] = useState<Filtro>('TODAS')
    const [aviso, setAviso] = useState<string | null>(null)
    const [homologando, setHomologando] = useState(false)

    const candidaturas = dados?.candidaturas ?? []
    const nomeDe = (c: Candidatura) => dados?.nomes.get(c.organizacaoId) ?? `Organização ${c.organizacaoId}`
    const notaDe = (c: Candidatura) => notaFinal(dados?.avaliacoes.get(c.id) ?? [])
    const contar = (f: Filtro) => candidaturas.filter((c) => f === 'TODAS' || GRUPO[f].includes(c.estado)).length
    const abas: Aba<Filtro>[] = [
        { id: 'TODAS', rotulo: 'Todas', quantidade: contar('TODAS') },
        { id: 'PENDENTES', rotulo: 'Elegibilidade pendente', quantidade: contar('PENDENTES') },
        { id: 'ANALISE', rotulo: 'Em análise', quantidade: contar('ANALISE') },
        { id: 'APROVADAS', rotulo: 'Aprovadas', quantidade: contar('APROVADAS') },
        { id: 'FORA', rotulo: 'Fora da seleção', quantidade: contar('FORA') },
    ]
    const visiveis = candidaturas.filter((c) => filtro === 'TODAS' || GRUPO[filtro].includes(c.estado))
    const naAvaliacao = candidaturas.filter((c) => NA_AVALIACAO.includes(c.estado)).length
    const decididas = candidaturas.filter((c) => DECIDIDAS.includes(c.estado)).length
    const aprovadasAguardando = candidaturas.filter((c) => c.estado === 'APROVADA')
    const suspensa = op ? estaSuspensa(op) : false
    const primeira = dados?.vagas?.listaDeEspera.find((l) => l.posicao === 1) ?? dados?.vagas?.listaDeEspera[0] ?? null
    const primeiraDaLista = primeira
        ? {
              candidaturaId: primeira.candidaturaId,
              nome:
                  dados?.nomes.get(candidaturas.find((c) => c.id === primeira.candidaturaId)?.organizacaoId ?? -1) ??
                  primeira.tituloProposta ??
                  `Candidatura ${primeira.candidaturaId}`,
          }
        : null

    async function depoisDaAcao(mensagem: string) {
        setAviso(mensagem)
        await recarregar()
    }

    return (
        <CascaDoApp itens={MENU_PROVEDOR}>
            <Cabecalho
                titulo="Candidaturas"
                apoio={
                    op
                        ? `${op.titulo} · ${op.estado === 'ENCERRADA' ? `encerrada em ${formatarData(op.encerradaEm)}` : dados?.versao?.prazoEnvio ? `envio até ${formatarData(dados.versao.prazoEnvio)}` : 'recebidas depois do envio'}`
                        : 'As candidaturas enviadas para as oportunidades da organização'
                }
                acoes={
                    <>
                        {escolha.oportunidades.length > 0 && (
                            <SeletorDeOportunidade
                                oportunidades={escolha.oportunidades}
                                escolhida={op}
                                aoEscolher={(id) => {
                                    setAviso(null)
                                    escolha.escolher(id)
                                }}
                            />
                        )}
                        {aprovadasAguardando.length > 0 && !suspensa && (
                            <Botao variante="primario" onClick={() => setHomologando(true)}>
                                Homologar resultado
                            </Botao>
                        )}
                    </>
                }
            />

            <div className="mt-6 flex flex-col gap-5">
                {escolha.carregando && !escolha.dados && <Carregando />}
                {escolha.erro && <ErroNaTela mensagem={escolha.erro} tentarDeNovo={() => void escolha.recarregar()} />}
                {escolha.dados && escolha.oportunidades.length === 0 && (
                    <Vazio titulo="Nenhuma oportunidade publicada">
                        As candidaturas aparecem aqui depois que uma oportunidade é publicada e recebe envios.{' '}
                        <Link to="/provedor" className={LINK_ACAO}>
                            Ir para o painel
                        </Link>
                    </Vazio>
                )}

                {aviso && <Aviso tipo="sucesso">{aviso}</Aviso>}
                {suspensa && (
                    <Aviso tipo="erro">
                        Esta oportunidade está pausada: a permissão de publicar foi revogada. Nenhuma etapa anda até a gestão aprovar
                        o novo pedido.
                    </Aviso>
                )}

                {op && carregando && !dados && <Carregando />}
                {op && erro && <ErroNaTela mensagem={erro} tentarDeNovo={() => void recarregar()} />}

                {dados && (
                    <>
                        <Indicadores
                            rotulo="Resumo das candidaturas"
                            itens={[
                                { id: 'recebidas', rotulo: 'Recebidas', valor: String(candidaturas.length), cor: 'text-titulo' },
                                { id: 'decididas', rotulo: 'Decididas', valor: `${decididas} de ${naAvaliacao}` },
                                {
                                    id: 'aprovadas',
                                    rotulo: 'Aprovadas',
                                    valor: String(candidaturas.filter((c) => APROVADAS.includes(c.estado)).length),
                                    cor: 'text-status-aprovada-texto',
                                },
                                {
                                    id: 'reprovadas',
                                    rotulo: 'Reprovadas',
                                    valor: String(candidaturas.filter((c) => c.estado === 'REPROVADA').length),
                                    cor: 'text-status-reprovada-texto',
                                },
                            ]}
                        />

                        {naAvaliacao > 0 && decididas === naAvaliacao && aprovadasAguardando.length > 0 && (
                            <p className="rounded-card bg-status-aprovada-fundo px-5 py-3 text-apoio text-status-aprovada-texto">
                                Os {decididas} pareceres estão assinados. O resultado já pode ser homologado.
                            </p>
                        )}

                        {candidaturas.length === 0 ? (
                            <Vazio titulo="Nenhuma candidatura enviada ainda">
                                O provedor vê a candidatura depois que a organização envia. Os rascunhos não aparecem.
                            </Vazio>
                        ) : (
                            <>
                                <AbasDeFiltro abas={abas} ativa={filtro} aoEscolher={setFiltro} rotulo="Filtrar candidaturas" />
                                {visiveis.length === 0 ? (
                                    <Vazio titulo="Nenhuma candidatura neste filtro" />
                                ) : (
                                    <Tabela
                                        rotulo="Candidaturas recebidas"
                                        colunas={['Organização', 'Compatibilidade', 'Elegibilidade', 'Avaliação', 'Nota final', 'Situação', 'Ações']}
                                    >
                                        {visiveis.map((c) => {
                                            const eleg = elegibilidadeDoEstado(c.estado)
                                            const avaliadores = rodadaAtual(dados.avaliacoes.get(c.id) ?? [])
                                            const compat = dados.compatibilidade.get(c.organizacaoId)
                                            return (
                                                <Linha key={c.id}>
                                                    <Celula forte>
                                                        <Link to={`/provedor/candidaturas/${c.id}`} className="hover:underline">
                                                            {nomeDe(c)}
                                                        </Link>
                                                        {c.tituloProposta && (
                                                            <span className="block text-legenda text-secundario">{c.tituloProposta}</span>
                                                        )}
                                                    </Celula>
                                                    <Celula>{compat ?? '—'}</Celula>
                                                    <Celula>
                                                        <SeloStatus status={eleg.status} rotulo={eleg.rotulo} comPonto />
                                                    </Celula>
                                                    <Celula>
                                                        {avaliadores.length > 0
                                                            ? avaliadores
                                                                  .map((a) => `${a.avaliadorNome ?? 'Avaliador'}${a.assinadaEm ? '' : ' (pendente)'}`)
                                                                  .join(', ')
                                                            : '—'}
                                                    </Celula>
                                                    <Celula>{formatarNota(notaDe(c))}</Celula>
                                                    <Celula>
                                                        <SeloStatus
                                                            status={statusDoEstado(c.estado)}
                                                            rotulo={
                                                                c.estado === 'LISTA_DE_ESPERA' && c.posicaoLista
                                                                    ? `Lista de espera · ${c.posicaoLista}º`
                                                                    : rotuloDoEstado(c.estado)
                                                            }
                                                            comPonto
                                                        />
                                                    </Celula>
                                                    <Celula>
                                                        <AcoesDaCandidatura
                                                            candidatura={c}
                                                            nome={nomeDe(c)}
                                                            prazoAjusteDias={dados.versao?.prazoAjusteDias ?? null}
                                                            autodeclaracoes={dados.declaracoes.get(c.id)}
                                                            primeiraDaLista={primeiraDaLista}
                                                            suspensa={suspensa}
                                                            aoMudar={depoisDaAcao}
                                                        />
                                                    </Celula>
                                                </Linha>
                                            )
                                        })}
                                    </Tabela>
                                )}
                            </>
                        )}

                        {op && (
                            <p className="text-legenda text-secundario">
                                Elegibilidade vem antes da nota: a não elegível nem chega à fila dos avaliadores.{' '}
                                <Link to={`/provedor/oportunidades/${op.id}/vagas`} className={LINK_ACAO}>
                                    Ver vagas e lista de espera
                                </Link>
                                {' · '}
                                <Link to={`/provedor/avaliadores?oportunidade=${op.id}`} className={LINK_ACAO}>
                                    Atribuir avaliadores
                                </Link>
                            </p>
                        )}
                    </>
                )}
            </div>

            {homologando && op && dados && (
                <ModalHomologar
                    titulo={op.titulo}
                    aprovadas={[...aprovadasAguardando].sort((a, b) => (notaDe(b) ?? -1) - (notaDe(a) ?? -1))}
                    reprovadas={candidaturas.filter((c) => c.estado === 'REPROVADA').length}
                    vagas={dados.vagas}
                    nomeDe={nomeDe}
                    aoFechar={() => setHomologando(false)}
                    aoTerminar={async (mensagem) => {
                        setHomologando(false)
                        await depoisDaAcao(mensagem)
                    }}
                />
            )}
        </CascaDoApp>
    )
}

/**
 * Modal · homologar resultado. A API homologa uma candidatura por vez: as
 * aprovadas seguem pela ordem da nota, e a que não cabe nas vagas (ou só
 * caberia numa reservada a que não concorre) vai para a lista de espera.
 */
function ModalHomologar({
    titulo,
    aprovadas,
    reprovadas,
    vagas,
    nomeDe,
    aoFechar,
    aoTerminar,
}: {
    titulo: string
    aprovadas: Candidatura[]
    reprovadas: number
    vagas: Vagas | null
    nomeDe: (c: Candidatura) => string
    aoFechar: () => void
    aoTerminar: (mensagem: string) => Promise<void>
}) {
    const [andando, setAndando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    async function executar() {
        setAndando(true)
        setErro(null)
        let homologadas = 0
        let naLista = 0
        try {
            for (const c of aprovadas) {
                try {
                    await homologar(c.id)
                    homologadas++
                } catch {
                    // sem vaga para ela: entra no fim da lista de espera
                    await porNaListaDeEspera(c.id)
                    naLista++
                }
            }
            await aoTerminar(
                `Resultado de ${titulo} homologado: ${homologadas} homologada${homologadas === 1 ? '' : 's'} e ${naLista} na lista de espera.`,
            )
        } catch (e) {
            setErro(`${mensagemDeErro(e)} (${homologadas} já homologadas, ${naLista} na lista de espera)`)
        } finally {
            setAndando(false)
        }
    }

    return (
        <Modal
            aberto
            titulo={`Homologar o resultado de ${titulo}?`}
            descricao="As aprovadas são homologadas pela ordem da nota final, até preencher as vagas; as que não cabem entram na lista de espera. A decisão não pode ser desfeita."
            aoFechar={aoFechar}
            acoes={
                <>
                    <Botao onClick={aoFechar}>Não</Botao>
                    <Botao variante="primario" disabled={andando} onClick={() => void executar()}>
                        {andando ? 'Homologando…' : 'Sim, homologar'}
                    </Botao>
                </>
            }
        >
            <dl className="flex flex-col gap-2 rounded-card bg-page p-4 text-apoio">
                <div className="flex justify-between">
                    <dt className="text-secundario">Aprovadas aguardando</dt>
                    <dd className="text-status-aprovada-texto">{aprovadas.length} candidaturas</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-secundario">Reprovadas</dt>
                    <dd className="text-status-reprovada-texto">{reprovadas} candidaturas</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-secundario">Vagas livres</dt>
                    <dd className="text-titulo">{vagas?.total === null || !vagas ? 'sem limite' : `${vagas.livres ?? 0} de ${vagas.total}`}</dd>
                </div>
                {vagas && vagas.reservas.length > 0 && (
                    <div className="flex justify-between">
                        <dt className="text-secundario">Reserva de vagas</dt>
                        <dd className="text-titulo">{vagas.reservas.map((r) => `${r.criterio}: ${r.ocupadas}/${r.quantidade}`).join(' · ')}</dd>
                    </div>
                )}
            </dl>
            <ol className="list-decimal pl-5 text-apoio text-titulo">
                {aprovadas.map((c) => (
                    <li key={c.id}>{nomeDe(c)}</li>
                ))}
            </ol>
            <p className="rounded-card bg-aviso-fundo p-3 text-legenda text-ocre">
                A ação fica registrada no histórico de auditoria com o seu nome, papel e data.
            </p>
            {erro && <Aviso tipo="erro">{erro}</Aviso>}
        </Modal>
    )
}

export default ProvedorCandidaturas
