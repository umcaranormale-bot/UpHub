import type { ReactNode } from 'react'

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
    acao: string
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
                <CustomButton variant="neutro" size="auto">
                    {acao}
                </CustomButton>
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
    pessoa: Pessoa
    /** Cartão da direita, acima dos vínculos: título e conteúdo livre. */
    destaqueTitulo: string
    destaque: ReactNode
    vinculos: Vinculo[]
    /** Bloco do meio da coluna da esquerda, próprio de cada papel. */
    children: ReactNode
}

export function PaginaDeConta({
    pessoa,
    destaqueTitulo,
    destaque,
    vinculos,
    children,
}: PaginaDeContaProps) {
    return (
        <>
            <h1 className="font-display text-tela text-titulo">Minha conta</h1>

            <div className="mt-6 flex items-start gap-6">
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

                            <CustomButton variant="neutro" size="auto">
                                Editar perfil
                            </CustomButton>
                        </div>

                        <dl className="mt-5 grid grid-cols-4 gap-5 border-t border-sutil pt-5">
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

                <aside className="flex w-[344px] shrink-0 flex-col gap-5">
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
                                    key={vinculo.organizacao}
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
