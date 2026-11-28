import type { ReactNode } from 'react'

import type { Motivo } from '../../api/matching'
import { CARTAO } from '../../estilos/classes'
import SeloStatus from '../SeloStatus'
import {
    SITUACAO_DA_ELEGIBILIDADE,
    SITUACAO_DO_REQUISITO,
    formatarValor,
    rotuloDoCampo,
    rotuloDoOperador,
} from './apoio'
import type { SituacaoRequisito } from '../../api/requisitos'

/**
 * Blocos visuais repetidos nas telas do candidato: o cartão com cabeçalho,
 * o selo da situação de um requisito, a tabela de requisitos, as barras do
 * matching e a linha do tempo da candidatura.
 */

export function Secao({
    titulo,
    subtitulo,
    acao,
    children,
    semRespiro = false,
}: {
    titulo: string
    subtitulo?: ReactNode
    acao?: ReactNode
    children: ReactNode
    /** Listas encostam na borda do cartão. */
    semRespiro?: boolean
}) {
    return (
        <section className={CARTAO}>
            <header className="flex items-start gap-3 border-b border-sutil p-card">
                <div className="min-w-0 flex-1">
                    <h2 className="font-display text-bloco text-titulo">{titulo}</h2>
                    {subtitulo && <p className="mt-1 text-apoio text-secundario">{subtitulo}</p>}
                </div>
                {acao}
            </header>
            <div className={semRespiro ? '' : 'p-card'}>{children}</div>
        </section>
    )
}

export function SeloDoRequisito({ situacao }: { situacao: SituacaoRequisito }) {
    const s = SITUACAO_DO_REQUISITO[situacao]
    return <SeloStatus status={s.status} rotulo={s.rotulo} comPonto />
}

export function SeloDaElegibilidade({ situacao }: { situacao: 'ELEGIVEL' | 'INELEGIVEL' | 'PENDENTE' }) {
    const s = SITUACAO_DA_ELEGIBILIDADE[situacao]
    return <SeloStatus status={s.status} rotulo={s.rotulo} comPonto />
}

export interface LinhaDeRequisito {
    id: number
    campo: string
    operador: string
    valorExigido: unknown
    valorInformado: string | number | null
    obrigatoria: boolean
    situacao: SituacaoRequisito
    explicacao?: string
}

/** Requisito por requisito: o que a oportunidade exige, o que a organização tem e o resultado. */
export function TabelaDeRequisitos({ linhas }: { linhas: LinhaDeRequisito[] }) {
    if (linhas.length === 0) {
        return <p className="text-apoio text-secundario">Esta oportunidade não tem requisitos de elegibilidade.</p>
    }
    return (
        <div className="relative overflow-x-auto rounded-card border border-sutil">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-sutil text-legenda uppercase text-secundario">
                        <th scope="col" className="px-4 py-3 font-semibold">Regra</th>
                        <th scope="col" className="px-4 py-3 font-semibold">Exigido</th>
                        <th scope="col" className="px-4 py-3 font-semibold">Informado</th>
                        <th scope="col" className="px-4 py-3 font-semibold">Resultado</th>
                    </tr>
                </thead>
                <tbody>
                    {linhas.map((l) => (
                        <tr key={l.id} className="border-b border-sutil align-top last:border-b-0">
                            <td className="px-4 py-3">
                                <p className="text-item text-titulo">{rotuloDoCampo(l.campo)}</p>
                                <p className="text-legenda text-secundario">{l.obrigatoria ? 'obrigatória' : 'desejável'}</p>
                            </td>
                            <td className="px-4 py-3 text-apoio text-secundario">
                                {rotuloDoOperador(l.operador)} {formatarValor(l.valorExigido)}
                            </td>
                            <td className="px-4 py-3 text-apoio text-secundario">{formatarValor(l.valorInformado)}</td>
                            <td className="px-4 py-3">
                                <SeloDoRequisito situacao={l.situacao} />
                                {l.explicacao && <p className="mt-1 text-legenda text-secundario">{l.explicacao}</p>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

/** Lista do que faltou, com o texto pronto que vem do motor. */
export function OQueFaltou({ itens }: { itens: string[] }) {
    if (itens.length === 0) return null
    return (
        <div className="rounded-card border border-aviso-borda bg-aviso-fundo p-4">
            <p className="text-item text-ocre">O que faltou</p>
            <ul className="mt-2 list-disc pl-5 text-apoio text-titulo">
                {itens.map((f) => (
                    <li key={f}>{f}</li>
                ))}
            </ul>
        </div>
    )
}

/** Uma barra por critério do matching, com os pontos e a explicação. */
export function BarrasDoMatch({ motivos }: { motivos: Motivo[] }) {
    return (
        <ul className="flex flex-col gap-3">
            {motivos.map((m) => {
                const parte = m.peso > 0 ? Math.round((m.pontos / m.peso) * 100) : 0
                return (
                    <li key={m.criterio} className="grid grid-cols-[120px_1fr_70px] items-center gap-x-4 gap-y-1 md:grid-cols-[120px_180px_70px_1fr]">
                        <span className="text-item text-titulo">{m.criterio}</span>
                        <span
                            className="h-2 overflow-hidden rounded-full bg-page"
                            role="img"
                            aria-label={`${m.pontos} de ${m.peso} pontos`}
                        >
                            <span className="block h-full rounded-full bg-acento" style={{ width: `${parte}%` }} />
                        </span>
                        <span className="text-apoio text-titulo">
                            {m.pontos} de {m.peso}
                        </span>
                        <span className="col-span-3 text-apoio text-secundario md:col-span-1">{m.explicacao}</span>
                    </li>
                )
            })}
        </ul>
    )
}

export interface PassoDaLinha {
    rotulo: string
    detalhe: string
    situacao: 'feito' | 'atual' | 'futuro'
}

/** A linha do tempo de etapas (Rascunho → Enviada → Em análise → Decisão → Acompanhamento). */
export function LinhaDoTempo({ passos }: { passos: PassoDaLinha[] }) {
    return (
        <ol className="grid gap-4" style={{ gridTemplateColumns: `repeat(${passos.length}, minmax(0, 1fr))` }}>
            {passos.map((p, i) => {
                const cor =
                    p.situacao === 'feito'
                        ? 'bg-status-aprovada-texto'
                        : p.situacao === 'atual'
                          ? 'bg-acento'
                          : 'bg-sutil'
                const linha = p.situacao === 'feito' ? 'bg-status-aprovada-texto' : 'bg-sutil'
                return (
                    <li key={p.rotulo} aria-current={p.situacao === 'atual' ? 'step' : undefined}>
                        <div className="flex items-center gap-2">
                            <span aria-hidden="true" className={`size-3 shrink-0 rounded-full ${cor}`} />
                            {i < passos.length - 1 && <span aria-hidden="true" className={`h-0.5 flex-1 ${linha}`} />}
                        </div>
                        <p className={`mt-2 text-item ${p.situacao === 'futuro' ? 'text-secundario' : 'text-titulo'}`}>
                            {p.rotulo}
                            <span className="sr-only">
                                {p.situacao === 'feito' ? ' (feito)' : p.situacao === 'atual' ? ' (agora)' : ' (depois)'}
                            </span>
                        </p>
                        <p className="mt-1 text-legenda text-secundario">{p.detalhe}</p>
                    </li>
                )
            })}
        </ol>
    )
}

/** Linha de lista dentro de um cartão: texto à esquerda, selo ou ação à direita. */
export function LinhaDeLista({ titulo, apoio, children }: { titulo: ReactNode; apoio?: ReactNode; children?: ReactNode }) {
    return (
        <li className="flex items-center gap-3 border-b border-sutil px-card py-4 last:border-b-0">
            <div className="min-w-0 flex-1">
                <p className="text-item text-titulo">{titulo}</p>
                {apoio && <p className="mt-1 text-apoio text-secundario">{apoio}</p>}
            </div>
            {children}
        </li>
    )
}
