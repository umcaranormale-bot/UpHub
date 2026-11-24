import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
    assinarAvaliacao,
    salvarAvaliacao,
    type Avaliacao,
    type Decisao,
    type ItemAjusteCadastro,
} from '../api/avaliacoes'
import { mensagemDeErro } from '../api/erros'
import { darNota } from '../api/notasPorCriterio'
import CascaDoApp from '../components/CascaDoApp'
import { CustomButton } from '../components/CustomButton'
import SeloStatus from '../components/SeloStatus'
import { carregarFicha, formatarNota, formatarNumero, notaFinalPrevista, type Ficha } from '../components/avaliador/ficha'
import {
    carregarFila,
    parecerEmVigor,
    ROTULO_DECISAO,
    situacaoNaFila,
    SITUACAO_NA_FILA,
    type ItemDaFila,
} from '../components/avaliador/fila'
import ModalDecisao from '../components/avaliador/ModalDecisao'
import ModalPedirAjuste from '../components/avaliador/ModalPedirAjuste'
import ModalRetificar from '../components/avaliador/ModalRetificar'
import RespostaAoAjuste from '../components/avaliador/RespostaAoAjuste'
import { Aviso, Carregando, ErroNaTela } from '../components/ui/Estados'
import { ANEL_FOCO, CARTAO, CARTAO_COM_RESPIRO, TRANSICAO_COR, TRANSICAO_ELEVACAO } from '../estilos/classes'
import { diasAte, formatarData, formatarDataHora, formatarMoeda, rotuloDoEstado, statusDoEstado } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_AVALIADOR } from '../navegacao/menus'

/**
 * 07 · Avaliador — rubrica e parecer · rota /avaliador/avaliacoes/:id
 *
 * Com os estados da mesma página: 34 (decisão registrada), 36 (reprovação
 * registrada) e 48 (2ª rodada, candidatura reenviada depois do ajuste).
 * Nota por critério, parecer, salvar rascunho e assinar; depois de assinada,
 * só o parecer muda, pela retificação.
 */

const ULTIMA_RODADA = 3

function textoDaNota(n: number | null): string {
    return n === null ? '' : String(n)
}

// ---------- coluna da fila

function ColunaDaFila({ fila, atual, prazo }: { fila: ItemDaFila[] | null; atual: number; prazo: string | null }) {
    return (
        <section aria-labelledby="titulo-fila" className="order-last w-full shrink-0 lg:order-none lg:w-[300px]">
            <h2 id="titulo-fila" className="text-selo text-titulo uppercase">
                Minha fila{fila ? ` · ${fila.length} candidatura(s)` : ''}
            </h2>
            <p className="mt-2 text-apoio text-secundario">
                O que falta assinar vem primeiro. A ordem é sugestão, não decisão.
            </p>
            {prazo && (
                <p className="mt-3 text-apoio text-acento">
                    Prazo para avaliar: {formatarData(prazo)}
                    {diasAte(prazo) >= 0 ? ` · faltam ${diasAte(prazo)} dia(s)` : ' · prazo vencido'}
                </p>
            )}
            {fila && (
                <ul className="mt-4 flex flex-col gap-3">
                    {fila.map((item) => {
                        const ativa = item.id === atual
                        const situacao = SITUACAO_NA_FILA[situacaoNaFila(item)]
                        return (
                            <li key={item.id}>
                                <Link
                                    to={`/avaliador/avaliacoes/${item.id}`}
                                    aria-current={ativa ? 'page' : undefined}
                                    className={[
                                        'block rounded-bloco border bg-card p-card shadow-card',
                                        'hover:-translate-y-px hover:shadow-card-hover',
                                        TRANSICAO_ELEVACAO,
                                        ANEL_FOCO,
                                        ativa ? 'border-acento shadow-acento' : 'border-sutil hover:border-acento',
                                    ].join(' ')}
                                >
                                    <span className="block text-item text-titulo">{item.organizacaoNome}</span>
                                    <span className="mt-1 block text-apoio text-secundario">
                                        {situacao.rotulo.toLowerCase()} · {item.rodada}ª rodada
                                    </span>
                                    <span className="mt-1 block text-apoio text-acento">{item.oportunidadeTitulo}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            )}
        </section>
    )
}

// ---------- proposta e documentos

function Proposta({ ficha }: { ficha: Ficha }) {
    const { candidatura, anexos } = ficha
    return (
        <section aria-labelledby="titulo-proposta" className={CARTAO_COM_RESPIRO}>
            <h2 id="titulo-proposta" className="font-display text-bloco text-titulo">
                Proposta
            </h2>
            <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="col-span-2">
                    <dt className="text-legenda text-secundario">Título</dt>
                    <dd className="mt-1 text-item text-titulo">{candidatura.tituloProposta ?? '—'}</dd>
                </div>
                <div>
                    <dt className="text-legenda text-secundario">Valor solicitado</dt>
                    <dd className="mt-1 text-item text-titulo">{formatarMoeda(candidatura.valorSolicitado)}</dd>
                </div>
                <div className="col-span-3">
                    <dt className="text-legenda text-secundario">Resumo executivo</dt>
                    <dd className="mt-1 whitespace-pre-line text-apoio text-titulo">{candidatura.resumoExecutivo ?? '—'}</dd>
                </div>
            </dl>
            <h3 className="mt-5 text-item text-titulo">Documentos anexados</h3>
            {anexos.length === 0 ? (
                <p className="mt-2 text-apoio text-secundario">Nenhum documento anexado.</p>
            ) : (
                <ul className="mt-2 flex flex-col gap-2">
                    {anexos.map((a) => (
                        <li key={a.documentoId} className="rounded-card bg-page px-4 py-3">
                            <p className="text-apoio text-titulo">{a.nomeArquivo}</p>
                            <p className="text-legenda text-secundario">
                                {[a.documentoExigidoNome ?? a.tipo, `${Math.max(1, Math.round(a.tamanhoBytes / 1024))} KB`, a.validade && `válido até ${formatarData(a.validade)}`]
                                    .filter(Boolean)
                                    .join(' · ')}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

// ---------- avaliação em aberto (rascunho)

interface EmAbertoProps {
    ficha: Ficha
    aoSalvar: (mensagem: string) => void
    aoAssinar: (resultado: Avaliacao, decisao: Decisao) => void
}

function AvaliacaoEmAberto({ ficha, aoSalvar, aoAssinar }: EmAbertoProps) {
    const { avaliacao, notas, organizacao } = ficha
    const [valores, setValores] = useState<Record<number, string>>(() =>
        Object.fromEntries(notas.map((n) => [n.criterioId, textoDaNota(n.nota)])),
    )
    const [parecer, setParecer] = useState(avaliacao.parecer ?? '')
    const [salvando, setSalvando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const [decidindo, setDecidindo] = useState<'APROVADA' | 'REPROVADA' | null>(null)
    const [pedindoAjuste, setPedindoAjuste] = useState(false)

    const somaDosPesos = notas.reduce((t, n) => t + n.peso, 0)
    const notaFinal = notaFinalPrevista(notas, valores)
    const emAnalise = avaliacao.estadoCandidatura === 'EM_ANALISE'
    const podePedirAjuste = avaliacao.rodada < ULTIMA_RODADA

    // nota fora da escala ou que não é número: a tela avisa antes de mandar
    const problemas = notas
        .map((n) => {
            const texto = valores[n.criterioId]?.trim() ?? ''
            if (!texto) return null
            const valor = Number(texto.replace(',', '.'))
            if (Number.isNaN(valor) || valor < n.escalaMin || valor > n.escalaMax) {
                return `A nota de "${n.descricao}" vai de ${formatarNumero(n.escalaMin)} a ${formatarNumero(n.escalaMax)}.`
            }
            return null
        })
        .filter((p): p is string => p !== null)
    const faltamNotas = notas.filter((n) => !(valores[n.criterioId]?.trim())).length
    const podeDecidir = emAnalise && problemas.length === 0 && faltamNotas === 0 && parecer.trim().length > 0

    async function salvarNotasEParecer(decisao?: Decisao) {
        for (const n of notas) {
            const texto = valores[n.criterioId]?.trim()
            if (!texto) continue
            const valor = Number(texto.replace(',', '.'))
            if (valor !== n.nota) await darNota(avaliacao.id, n.criterioId, valor)
        }
        await salvarAvaliacao(avaliacao.id, { parecer: parecer.trim(), ...(decisao ? { decisao } : {}) })
    }

    async function salvarRascunho() {
        if (problemas.length > 0) return
        setSalvando(true)
        setErro(null)
        try {
            await salvarNotasEParecer()
            aoSalvar('Rascunho salvo. As notas e o parecer ficam guardados até você assinar.')
        } catch (e) {
            setErro(mensagemDeErro(e))
        } finally {
            setSalvando(false)
        }
    }

    async function assinar(decisao: Decisao, itens?: ItemAjusteCadastro[]) {
        await salvarNotasEParecer(decisao)
        const resultado = await assinarAvaliacao(avaliacao.id, itens)
        setDecidindo(null)
        setPedindoAjuste(false)
        aoAssinar(resultado, decisao)
    }

    const notaNaTela = formatarNota(notaFinal)

    return (
        <>
            <section aria-labelledby="titulo-rubrica" className={CARTAO}>
                <header className="border-b border-sutil p-card">
                    <h2 id="titulo-rubrica" className="font-display text-bloco text-titulo">
                        Pontuar pela rubrica{avaliacao.rodada > 1 ? ` · ${avaliacao.rodada}ª rodada` : ''}
                    </h2>
                    <p className="mt-1 text-apoio text-secundario">
                        Critérios e pesos vêm da versão da oportunidade em que a candidatura foi enviada. A nota final é
                        calculada pelo sistema na assinatura.
                    </p>
                </header>

                {notas.length === 0 && (
                    <p className="px-card py-4 text-apoio text-secundario">
                        Esta oportunidade não tem critérios na rubrica: a avaliação vai sem nota final, só com a decisão e o
                        parecer.
                    </p>
                )}

                {notas.map((n) => {
                    const id = `nota-${n.criterioId}`
                    return (
                        <div
                            key={n.criterioId}
                            className={`flex items-center gap-4 border-b border-sutil px-card py-4 hover:bg-page ${TRANSICAO_COR}`}
                        >
                            <div className="min-w-0 flex-1">
                                <label htmlFor={id} className="text-corpo text-titulo">
                                    {n.descricao}
                                </label>
                                {n.evidenciaEsperada && (
                                    <p className="mt-1 text-legenda text-secundario">Evidência esperada: {n.evidenciaEsperada}</p>
                                )}
                            </div>
                            <span className="text-apoio text-secundario">
                                peso {formatarNumero(n.peso)}
                                {somaDosPesos > 0 && ` · ${Math.round((n.peso / somaDosPesos) * 100)}%`}
                            </span>
                            <span className="flex items-center gap-1">
                                <input
                                    id={id}
                                    type="number"
                                    inputMode="decimal"
                                    min={n.escalaMin}
                                    max={n.escalaMax}
                                    step={0.5}
                                    value={valores[n.criterioId] ?? ''}
                                    placeholder="—"
                                    onChange={(e) => setValores((atual) => ({ ...atual, [n.criterioId]: e.target.value }))}
                                    disabled={!emAnalise}
                                    className={`w-20 rounded-card border border-sutil px-2 py-1 text-right text-corpo text-titulo ${TRANSICAO_ELEVACAO} ${ANEL_FOCO} hover:border-acento`}
                                />
                                <span className="text-corpo text-secundario">
                                    {n.escalaMin === 0 ? `/ ${formatarNumero(n.escalaMax)}` : `de ${formatarNumero(n.escalaMin)} a ${formatarNumero(n.escalaMax)}`}
                                </span>
                            </span>
                        </div>
                    )
                })}

                <div className="flex items-center justify-between rounded-b-bloco bg-acento-suave px-card py-4">
                    <span className="text-corpo text-acento">Nota final ponderada (0 a 100)</span>
                    <output aria-live="polite" className="font-display text-bloco text-acento">
                        {notaNaTela}
                    </output>
                </div>
            </section>

            <section aria-labelledby="titulo-parecer" className={CARTAO_COM_RESPIRO}>
                <h2 id="titulo-parecer" className="font-display text-bloco text-titulo">
                    Parecer (obrigatório)
                </h2>
                <p className="mt-1 text-apoio text-secundario" id="ajuda-parecer">
                    É exatamente este texto que o candidato lê no extrato. Decisão sem parecer é recusada pelo sistema.
                </p>
                <label htmlFor="parecer" className="sr-only">
                    Parecer da avaliação
                </label>
                <textarea
                    id="parecer"
                    rows={5}
                    value={parecer}
                    aria-describedby="ajuda-parecer"
                    placeholder="Escreva o parecer depois de pontuar todos os critérios."
                    disabled={!emAnalise}
                    onChange={(e) => setParecer(e.target.value)}
                    className={`mt-4 w-full rounded-card border border-sutil p-4 text-corpo text-titulo ${TRANSICAO_ELEVACAO} ${ANEL_FOCO} hover:border-acento`}
                />
            </section>

            {problemas.map((p) => (
                <Aviso key={p} tipo="erro">
                    {p}
                </Aviso>
            ))}
            {erro && <Aviso tipo="erro">{erro}</Aviso>}

            {emAnalise && (
                <div className="flex flex-wrap items-center gap-3">
                    <CustomButton variant="aprovar" size="auto" type="button" disabled={!podeDecidir} onClick={() => setDecidindo('APROVADA')}>
                        Aprovar
                    </CustomButton>
                    <CustomButton variant="reprovar" size="auto" type="button" disabled={!podeDecidir} onClick={() => setDecidindo('REPROVADA')}>
                        Reprovar
                    </CustomButton>
                    {podePedirAjuste && (
                        <CustomButton variant="neutro" size="auto" type="button" disabled={!podeDecidir} onClick={() => setPedindoAjuste(true)}>
                            {avaliacao.rodada === ULTIMA_RODADA - 1 ? 'Pedir ajuste (2º e último)' : 'Pedir ajuste'}
                        </CustomButton>
                    )}
                    <button
                        type="button"
                        disabled={salvando || problemas.length > 0}
                        onClick={() => void salvarRascunho()}
                        className={`ml-auto rounded-card px-1 text-corpo text-acento underline hover:text-titulo disabled:opacity-50 ${TRANSICAO_COR} ${ANEL_FOCO}`}
                    >
                        {salvando ? 'Salvando…' : 'Salvar pontuação sem decidir'}
                    </button>
                    {!podeDecidir && (
                        <p className="w-full text-apoio text-secundario">
                            {faltamNotas > 0
                                ? `Dê nota a todos os critérios (faltam ${faltamNotas}) e escreva o parecer para liberar a decisão.`
                                : 'Escreva o parecer para liberar a decisão.'}
                        </p>
                    )}
                    {!podePedirAjuste && (
                        <p className="w-full text-apoio text-secundario">
                            Rodada {ULTIMA_RODADA}, a última: a decisão é só aprovar ou reprovar.
                        </p>
                    )}
                </div>
            )}

            <ModalDecisao
                key={decidindo ?? 'fechado'}
                decisao={decidindo}
                organizacaoNome={organizacao.nome}
                notaFinal={notaNaTela}
                parecer={parecer.trim()}
                aoFechar={() => setDecidindo(null)}
                aoConfirmar={() => assinar(decidindo ?? 'APROVADA')}
            />
            {podePedirAjuste && (
                <ModalPedirAjuste
                    aberto={pedindoAjuste}
                    organizacaoNome={organizacao.nome}
                    oportunidadeId={avaliacao.oportunidadeId}
                    versaoId={ficha.candidatura.versaoId}
                    rodada={avaliacao.rodada}
                    parecer={parecer}
                    aoMudarParecer={setParecer}
                    aoFechar={() => setPedindoAjuste(false)}
                    aoConfirmar={(itens) => assinar('AJUSTE', itens)}
                />
            )}
        </>
    )
}

// ---------- avaliação assinada

function AvaliacaoAssinada({ ficha, aoRetificar }: { ficha: Ficha; aoRetificar: () => void }) {
    const { avaliacao, notas, retificacoes } = ficha
    const [retificando, setRetificando] = useState(false)
    const decisao = avaliacao.decisao
    const statusDaDecisao = decisao === 'APROVADA' ? 'aprovada' : decisao === 'REPROVADA' ? 'reprovada' : 'pendente'

    return (
        <>
            <section aria-labelledby="titulo-assinada" className={CARTAO}>
                <header className="flex items-center gap-3 border-b border-sutil p-card">
                    <h2 id="titulo-assinada" className="min-w-0 flex-1 font-display text-bloco text-titulo">
                        Avaliação assinada em {formatarDataHora(avaliacao.assinadaEm)}
                    </h2>
                    <SeloStatus status={statusDaDecisao} rotulo={decisao ? ROTULO_DECISAO[decisao] : 'Sem decisão'} comPonto />
                </header>
                {notas.map((n) => (
                    <div key={n.criterioId} className="flex items-center gap-4 border-b border-sutil px-card py-3">
                        <span className="min-w-0 flex-1 text-corpo text-titulo">{n.descricao}</span>
                        <span className="text-apoio text-secundario">peso {formatarNumero(n.peso)}</span>
                        <span className="w-24 text-right text-item text-titulo">
                            {n.nota === null ? '—' : formatarNumero(n.nota)} / {formatarNumero(n.escalaMax)}
                        </span>
                    </div>
                ))}
                <div className="flex items-center justify-between rounded-b-bloco bg-acento-suave px-card py-4">
                    <span className="text-corpo text-acento">Nota final ponderada (0 a 100)</span>
                    <span className="font-display text-bloco text-acento">{formatarNota(avaliacao.notaFinal)}</span>
                </div>
            </section>

            <section aria-labelledby="titulo-parecer-assinado" className={CARTAO_COM_RESPIRO}>
                <div className="flex items-center gap-3">
                    <h2 id="titulo-parecer-assinado" className="font-display text-bloco text-titulo">
                        Parecer
                    </h2>
                    {avaliacao.parecerRetificado && (
                        <SeloStatus status="enviada" rotulo={`Retificado em ${formatarData(avaliacao.retificadaEm)}`} />
                    )}
                    <span className="ml-auto">
                        <CustomButton variant="neutro" size="auto" type="button" onClick={() => setRetificando(true)}>
                            Retificar parecer
                        </CustomButton>
                    </span>
                </div>
                <p className="mt-4 whitespace-pre-line rounded-card bg-page p-4 text-corpo text-titulo">
                    {parecerEmVigor(avaliacao) || '—'}
                </p>

                {retificacoes.length > 0 && (
                    <>
                        <h3 className="mt-5 text-item text-titulo">Histórico do parecer</h3>
                        <ol className="mt-2 flex flex-col gap-2">
                            <li className="rounded-card border border-sutil px-4 py-3">
                                <p className="text-legenda text-secundario">
                                    Original · assinado em {formatarDataHora(avaliacao.assinadaEm)}
                                </p>
                                <p className="mt-1 whitespace-pre-line text-apoio text-titulo">{avaliacao.parecer}</p>
                            </li>
                            {retificacoes.map((r) => (
                                <li key={r.id} className="rounded-card border border-sutil px-4 py-3">
                                    <p className="text-legenda text-secundario">
                                        Retificação de {formatarDataHora(r.retificadaEm)} · justificativa: {r.justificativa}
                                    </p>
                                    <p className="mt-1 whitespace-pre-line text-apoio text-titulo">{r.parecerRetificado}</p>
                                </li>
                            ))}
                        </ol>
                    </>
                )}
            </section>

            <ModalRetificar
                key={retificando ? 'aberto' : 'fechado'}
                avaliacao={retificando ? avaliacao : null}
                aoFechar={() => setRetificando(false)}
                aoRetificar={() => {
                    setRetificando(false)
                    aoRetificar()
                }}
            />
        </>
    )
}

// ---------- a página

function mensagemDaAssinatura(decisao: Decisao, resultado: Avaliacao, organizacaoNome: string): string {
    const fechou = resultado.estadoCandidatura !== 'EM_ANALISE'
    const rodada = fechou
        ? ` A rodada fechou e a candidatura agora está: ${rotuloDoEstado(resultado.estadoCandidatura)}.`
        : ' A candidatura segue em análise até os outros avaliadores da rodada assinarem.'
    if (decisao === 'AJUSTE') {
        return `Pedido de ajuste registrado para ${organizacaoNome}.${rodada}${
            resultado.estadoCandidatura === 'AJUSTE' ? ' A organização já recebeu os itens e o prazo para reenviar.' : ''
        }`
    }
    const inicio = decisao === 'APROVADA' ? 'Decisão registrada' : 'Reprovação registrada'
    return `${inicio} para ${organizacaoNome}.${rodada}${fechou ? ' O candidato recebe o resultado com o seu parecer.' : ''}`
}

function AvaliadorAvaliacao() {
    const { id } = useParams()
    const avaliacaoId = Number(id)
    const valido = Number.isInteger(avaliacaoId) && avaliacaoId > 0
    const ficha = useDados(() => carregarFicha(avaliacaoId), [avaliacaoId], valido)
    const fila = useDados(() => carregarFila(), [])
    const [aviso, setAviso] = useState<{ id: number; texto: string } | null>(null)

    const dados = ficha.dados?.avaliacao.id === avaliacaoId ? ficha.dados : null
    const avisoDaTela = aviso?.id === avaliacaoId ? aviso.texto : null
    const proxima = fila.dados?.find((a) => a.id !== avaliacaoId && !a.assinadaEm && a.estadoCandidatura === 'EM_ANALISE')

    function recarregarTudo() {
        void ficha.recarregar()
        void fila.recarregar()
    }

    let conteudo
    if (!valido) {
        conteudo = <ErroNaTela mensagem="Avaliação não encontrada" />
    } else if (ficha.erro && !dados) {
        conteudo = <ErroNaTela mensagem={ficha.erro} tentarDeNovo={() => void ficha.recarregar()} />
    } else if (!dados) {
        conteudo = <Carregando />
    } else {
        const { avaliacao, organizacao, oportunidade, ajustes, minhasRodadas } = dados
        const pedidoAnterior =
            avaliacao.rodada > 1
                ? [...ajustes].filter((p) => p.reenviadoEm && (p.rodada ?? 0) < avaliacao.rodada).pop()
                : undefined
        const minhaAnterior = minhasRodadas.find((a) => a.rodada === avaliacao.rodada - 1)

        conteudo = (
            <>
                <div className="flex items-start justify-between gap-6">
                    <div>
                        <h1 className="font-display text-tela text-titulo">Ficha da candidatura · {organizacao.nome}</h1>
                        <p className="mt-2 text-apoio text-secundario">
                            {oportunidade.titulo} · {avaliacao.rodada}ª rodada
                            {pedidoAnterior?.reenviadoEm &&
                                ` · reenviada em ${formatarData(pedidoAnterior.reenviadoEm)} após o seu pedido de ajuste`}
                            {' · '}atribuída em {formatarData(avaliacao.atribuidaEm)}
                        </p>
                    </div>
                    <SeloStatus status={statusDoEstado(avaliacao.estadoCandidatura)} rotulo={rotuloDoEstado(avaliacao.estadoCandidatura)} />
                </div>

                {avisoDaTela && (
                    <div className="mt-6 flex flex-col gap-2">
                        <Aviso tipo="sucesso">{avisoDaTela}</Aviso>
                        {proxima && avaliacao.assinadaEm && (
                            <Link
                                to={`/avaliador/avaliacoes/${proxima.id}`}
                                className={`self-start rounded-card text-apoio font-semibold text-acento hover:text-titulo ${ANEL_FOCO}`}
                            >
                                Abrir a próxima da fila: {proxima.organizacaoNome} ›
                            </Link>
                        )}
                    </div>
                )}

                {!avaliacao.assinadaEm && avaliacao.estadoCandidatura !== 'EM_ANALISE' && (
                    <div className="mt-6">
                        <Aviso tipo="erro">
                            Esta candidatura não está mais em análise ({rotuloDoEstado(avaliacao.estadoCandidatura)}): a
                            avaliação não pode ser assinada.
                        </Aviso>
                    </div>
                )}

                <div className="mt-8 flex flex-col gap-6 lg:flex-row">
                    <ColunaDaFila fila={fila.dados} atual={avaliacao.id} prazo={avaliacao.assinadaEm ? null : avaliacao.prazoAvaliacao} />

                    <div className="flex min-w-0 flex-1 flex-col gap-6">
                        {pedidoAnterior && (
                            <RespostaAoAjuste pedido={pedidoAnterior} anterior={minhaAnterior} organizacaoNome={organizacao.nome} />
                        )}
                        <Proposta ficha={dados} />
                        {avaliacao.assinadaEm ? (
                            <AvaliacaoAssinada
                                ficha={dados}
                                aoRetificar={() => {
                                    setAviso({
                                        id: avaliacao.id,
                                        texto: 'Parecer retificado. O candidato passa a ler o texto novo; o original fica no histórico.',
                                    })
                                    recarregarTudo()
                                }}
                            />
                        ) : (
                            <AvaliacaoEmAberto
                                key={avaliacao.id}
                                ficha={dados}
                                aoSalvar={(texto) => {
                                    setAviso({ id: avaliacao.id, texto })
                                    recarregarTudo()
                                }}
                                aoAssinar={(resultado, decisao) => {
                                    setAviso({ id: avaliacao.id, texto: mensagemDaAssinatura(decisao, resultado, organizacao.nome) })
                                    recarregarTudo()
                                }}
                            />
                        )}
                    </div>
                </div>
            </>
        )
    }

    return (
        <CascaDoApp itens={MENU_AVALIADOR} voltarPara="/avaliador">
            {conteudo}
        </CascaDoApp>
    )
}

export default AvaliadorAvaliacao
