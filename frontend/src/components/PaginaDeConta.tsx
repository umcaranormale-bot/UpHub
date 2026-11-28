import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { iniciais as iniciaisDe, ROTULO_DA_AREA } from '../navegacao/areas'
import { useSessao } from '../sessao/contexto'
import { formatarData } from '../estilos/formatos'

import { CustomButton } from './CustomButton'
import SeloStatus, { type Status } from './SeloStatus'
import { ANEL_FOCO } from '../estilos/classes'

interface BlocoDoPapelProps {
    titulo: string
    status: Status
    rotuloDoStatus?: string
    chamada: string
    contexto: string
    explicacao: string
    /** Texto do botão da direita. Sem ele, o bloco fica sem botão. */
    acao?: string
    /** Rota do botão (vira um link). */
    para?: string
    aoClicar?: () => void
}

/**
 * BlocoDoPapel — o cartão do meio das telas de conta: último parecer, alocação
 * atual, resultado da candidatura, pendências. Muda o texto, não a forma.
 */
export function BlocoDoPapel({
    titulo,
    status,
    rotuloDoStatus,
    chamada,
    contexto,
    explicacao,
    acao,
    para,
    aoClicar,
}: BlocoDoPapelProps) {
    return (
        <section
            aria-labelledby="titulo-bloco-papel"
            className="rounded-bloco border border-sutil bg-card p-card shadow-card"
        >
            <div className="flex items-center gap-3">
                <h2 id="titulo-bloco-papel" className="font-display text-bloco text-titulo">
                    {titulo}
                </h2>
                <span className="ml-auto">
                    <SeloStatus status={status} rotulo={rotuloDoStatus} comPonto />
                </span>
            </div>

            <div className="mt-4 flex items-center gap-5 rounded-card bg-page p-5">
                <div className="min-w-0 flex-1">
                    <p className="font-display text-bloco text-titulo">{chamada}</p>
                    <p className="mt-1 text-apoio text-secundario">{contexto}</p>
                    <p className="mt-2 text-apoio text-secundario">{explicacao}</p>
                </div>
                {acao && para && (
                    <Link
                        to={para}
                        className={`rounded-lg border border-sutil bg-card px-4 py-2 text-apoio font-semibold text-titulo hover:bg-page ${ANEL_FOCO}`}
                    >
                        {acao}
                    </Link>
                )}
                {acao && !para && (
                    <CustomButton variant="neutro" size="auto" onClick={aoClicar}>
                        {acao}
                    </CustomButton>
                )}
            </div>
        </section>
    )
}

/**
 * PaginaDeConta — o miolo das quatro telas de conta do protótipo (57, 59, 60 e 61).
 *
 * As quatro repetem a mesma estrutura: cartão de identificação, um bloco do
 * papel no meio, e à direita um destaque, os vínculos e o encerrar sessão.
 * O que muda é o conteúdo, então ele entra por propriedade.
 */

export interface Pessoa {
    iniciais: string
    nome: string
    email: string
    telefone: string
    funcao: string
    criadaEm: string
    id: string
}

export interface Vinculo {
    organizacao: string
    papel: string
}

interface PaginaDeContaProps {
    /** Sem ela, a pessoa vem da sessão (quem está logado). */
    pessoa?: Pessoa
    /** Cartão da direita, acima dos vínculos: título e conteúdo livre. */
    destaqueTitulo: string
    destaque: ReactNode
    /** Sem eles, os vínculos ativos vêm da sessão. */
    vinculos?: Vinculo[]
    /** Bloco do meio da coluna da esquerda, próprio de cada papel. */
    children: ReactNode
}

export function PaginaDeConta({
    pessoa: pessoaRecebida,
    destaqueTitulo,
    destaque,
    vinculos: vinculosRecebidos,
    children,
}: PaginaDeContaProps) {
    const { sair, pessoa: logada, perfis, perfilAtivo } = useSessao()
    const navigate = useNavigate()
    const pessoa: Pessoa = pessoaRecebida ?? {
        iniciais: iniciaisDe(logada?.nome ?? ''),
        nome: logada?.nome ?? '',
        email: logada?.email ?? '',
        telefone: logada?.telefone ?? '—',
        funcao: perfilAtivo?.vinculo.funcao ?? (perfilAtivo ? ROTULO_DA_AREA[perfilAtivo.area] : '—'),
        criadaEm: formatarData(logada?.criadaEm),
        id: logada ? `USR-${String(logada.id).padStart(4, '0')}` : '—',
    }
    const vinculos: Vinculo[] =
        vinculosRecebidos ??
        perfis.map((p) => ({ organizacao: p.vinculo.organizacaoNome, papel: ROTULO_DA_AREA[p.area] }))
    return (
        <>
            <h1 className="font-display text-tela text-titulo">Minha conta</h1>

            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
                <div className="flex min-w-0 flex-1 flex-col gap-5">
                    <section
                        aria-label="Identificação"
                        className="rounded-bloco border border-sutil bg-card p-card shadow-card"
                    >
                        <div className="flex items-center gap-5">
                            <span
                                aria-hidden="true"
                                className="grid size-16 shrink-0 place-items-center rounded-full border border-acento bg-acento-suave font-display text-h3 text-acento"
                            >
                                {pessoa.iniciais}
                            </span>

                            <div className="min-w-0 flex-1">
                                <p className="font-display text-h3 text-titulo">{pessoa.nome}</p>
                                <p className="mt-1 text-apoio text-secundario">
                                    {pessoa.email} · {pessoa.telefone}
                                </p>
                                <p className="mt-1 text-apoio text-secundario">
                                    Conta criada em {pessoa.criadaEm} · ID {pessoa.id}
                                </p>
                            </div>

                            {/* A API ainda não tem a edição dos dados da pessoa (pessoas.ts só cadastra e busca). */}
                        </div>

                        <dl className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-4 border-t border-sutil pt-5">
                            <div>
                                <dt className="text-apoio text-secundario">Nome completo</dt>
                                <dd className="mt-1 text-item text-titulo">{pessoa.nome}</dd>
                            </div>
                            <div>
                                <dt className="text-apoio text-secundario">E-mail</dt>
                                <dd className="mt-1 break-words text-item text-titulo">
                                    {pessoa.email}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-apoio text-secundario">Telefone</dt>
                                <dd className="mt-1 text-item text-titulo">{pessoa.telefone}</dd>
                            </div>
                            <div>
                                <dt className="text-apoio text-secundario">Função</dt>
                                <dd className="mt-1 text-item text-titulo">{pessoa.funcao}</dd>
                            </div>
                        </dl>
                    </section>

                    {children}
                </div>

                <aside className="flex w-full shrink-0 lg:w-[344px] flex-col gap-5">
                    <section
                        aria-labelledby="titulo-destaque"
                        className="rounded-bloco border border-sutil bg-card p-card shadow-card"
                    >
                        <h2
                            id="titulo-destaque"
                            className="font-display text-bloco text-titulo"
                        >
                            {destaqueTitulo}
                        </h2>
                        {destaque}
                    </section>

                    <section
                        aria-labelledby="titulo-vinculos"
                        className="rounded-bloco border border-sutil bg-card shadow-card"
                    >
                        <header className="border-b border-sutil p-card">
                            <h2
                                id="titulo-vinculos"
                                className="font-display text-bloco text-titulo"
                            >
                                Meus vínculos
                            </h2>
                        </header>

                        <ul>
                            {vinculos.map((vinculo) => (
                                <li
                                    key={`${vinculo.organizacao}-${vinculo.papel}`}
                                    className="flex items-center gap-3 border-b border-sutil px-card py-4 last:border-b-0"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="text-item text-titulo">
                                            {vinculo.organizacao}
                                        </p>
                                        <p className="mt-1 text-apoio text-secundario">
                                            {vinculo.papel}
                                        </p>
                                    </div>
                                    <span className="rounded-badge bg-acento-suave px-2.5 py-1 text-selo text-acento">
                                        Ativo
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section
                        aria-labelledby="titulo-encerrar"
                        className="rounded-bloco border border-status-reprovada-borda bg-status-reprovada-fundo p-card"
                    >
                        <h2
                            id="titulo-encerrar"
                            className="font-display text-bloco text-status-reprovada-texto"
                        >
                            Encerrar sessão
                        </h2>
                        <p className="mt-2 text-apoio text-secundario">
                            Você volta para a tela inicial pública. Os rascunhos ficam salvos.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                sair()
                                navigate('/')
                            }}
                            className={`mt-4 h-[45px] w-full rounded-lg bg-status-reprovada-texto font-semibold text-white transition-opacity duration-[var(--dur-rapida)] ease-padrao hover:opacity-90 ${ANEL_FOCO}`}
                        >
                            Sair da conta
                        </button>
                    </section>
                </aside>
            </div>
        </>
    )
}

export default PaginaDeConta
