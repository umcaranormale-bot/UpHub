import { useState } from 'react'

import { CustomButton } from '../components/CustomButton'
import CascaDoApp from '../components/CascaDoApp'
import { MENU_MENTOR } from '../navegacao/menus'
import { ANEL_FOCO, TRANSICAO_COR } from '../estilos/classes'

/**
 * 40 · Mentor — registrar feedback e horas · rota /horas
 *
 * Tela de tarefa: o protótipo troca o menu lateral por "‹ Voltar · Registrar
 * sessão" no topo, porque aqui o mentor termina uma coisa só.
 *
 * O feedback começa vazio de propósito (HU-14): o rascunho da IA precisa ser
 * aberto pelo mentor, e o sistema registra se houve edição.
 *
 * Dados simulados nesta etapa, conforme o Bloco 4: nenhuma chamada à API.
 */


const CAMPO =
    'w-full rounded-card border border-sutil bg-card px-4 py-3 text-apoio text-titulo outline-none ${TRANSICAO_COR} focus:border-acento'

function RegistrarSessao() {
    const [feedback, setFeedback] = useState('')

    const podeAssinar = feedback.trim().length > 0

    return (
        <CascaDoApp
            organizacao="Movetech"
            papel="Mentor"
            iniciais="PT"
            nome="Paulo Tavares"
            itens={MENU_MENTOR}
            voltarPara="/mentor"
            tituloDoTopo="Registrar sessão"
            semMenu
        >
            <h1 className="font-display text-tela text-titulo">
                Registrar feedback e horas
            </h1>

            <div className="mt-6 flex items-start gap-5">
                <section
                    aria-labelledby="titulo-feedback"
                    className="min-w-0 flex-1 rounded-bloco border border-sutil bg-card p-card shadow-card"
                >
                    <h2 id="titulo-feedback" className="font-display text-bloco text-titulo">
                        Feedback da sessão
                    </h2>

                    <div className="mt-5 flex items-center gap-4">
                        <span
                            aria-hidden="true"
                            className="grid size-14 shrink-0 place-items-center rounded-full border border-acento bg-acento-suave font-display text-h3 text-acento"
                        >
                            S3
                        </span>
                        <span className="rounded-card border border-sutil px-4 py-2 text-item text-titulo">
                            Squad 3 · FICR
                        </span>
                        <span className="rounded-card border border-status-reprovada-borda px-4 py-2 text-item text-status-reprovada-texto">
                            Sprint 3
                        </span>
                    </div>
                    <p className="mt-3 text-apoio text-secundario">
                        Sessão de 16/10/2026 · Desafio Logística Urbana
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-5">
                        <div>
                            <label
                                htmlFor="feedback"
                                className="block text-apoio text-titulo"
                            >
                                Feedback (texto final seu)
                            </label>
                            <textarea
                                id="feedback"
                                rows={3}
                                value={feedback}
                                onChange={(evento) => setFeedback(evento.target.value)}
                                className={`mt-2 resize-y ${CAMPO} ${ANEL_FOCO}`}
                            />
                            <p className="mt-2 text-apoio text-secundario">
                                Começa vazio. O rascunho a partir dos registros precisa ser
                                aberto por você e o sistema registra se houve edição.
                            </p>
                        </div>

                        <div className="flex flex-col gap-5">
                            <div>
                                <label htmlFor="data" className="block text-apoio text-titulo">
                                    Data da sessão
                                </label>
                                <input
                                    id="data"
                                    type="text"
                                    defaultValue="16/10/2026"
                                    className={`mt-2 ${CAMPO} ${ANEL_FOCO}`}
                                />
                                <p className="mt-2 text-apoio text-secundario">
                                    As horas entram no acumulado do mês
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="sprint"
                                    className="block text-apoio text-titulo"
                                >
                                    Sprint
                                </label>
                                <input
                                    id="sprint"
                                    type="text"
                                    defaultValue="Sprint 3 · entrega até 10/10"
                                    className={`mt-2 ${CAMPO} ${ANEL_FOCO}`}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="duracao" className="mt-5 block text-apoio text-titulo">
                            Duração da sessão
                        </label>
                        <input
                            id="duracao"
                            type="text"
                            defaultValue="1 h 30 min"
                            className={`mt-2 max-w-[240px] ${CAMPO} ${ANEL_FOCO}`}
                        />
                    </div>

                    <div className="mt-6 flex items-center gap-4 border-t border-sutil pt-5">
                        <CustomButton variant="aprovar" size="auto" disabled={!podeAssinar}>
                            Salvar e assinar
                        </CustomButton>
                        <CustomButton variant="neutro" size="auto">
                            Cancelar
                        </CustomButton>
                        <button
                            type="button"
                            className={`ml-2 rounded-card px-2 py-2 text-apoio text-acento ${TRANSICAO_COR} hover:text-titulo ${ANEL_FOCO}`}
                        >
                            Abrir rascunho da IA ›
                        </button>
                        {!podeAssinar && (
                            <p className="ml-auto text-apoio text-secundario">
                                Escreva o feedback para liberar a assinatura
                            </p>
                        )}
                    </div>
                </section>

                <aside className="flex w-[344px] shrink-0 flex-col gap-5">
                    <section
                        aria-labelledby="titulo-horas"
                        className="rounded-bloco border border-sutil bg-card p-card shadow-card"
                    >
                        <h2 id="titulo-horas" className="font-display text-bloco text-titulo">
                            Horas doadas em outubro
                        </h2>
                        <p className="mt-3 text-apoio text-secundario">
                            12 h 30 min em 5 sessões. O total aparece no seu perfil e no
                            histórico do acompanhado (HU-17).
                        </p>
                        <span className="mt-4 block">
                            <CustomButton variant="neutro" size="grande">
                                Ver todas as sessões
                            </CustomButton>
                        </span>
                    </section>

                    <section
                        aria-labelledby="titulo-visibilidade"
                        className="rounded-bloco bg-acento-suave p-card"
                    >
                        <h2
                            id="titulo-visibilidade"
                            className="font-display text-bloco text-acento"
                        >
                            Visibilidade
                        </h2>
                        <p className="mt-2 text-apoio text-titulo">
                            O feedback só aparece para a squad depois de assinado. Enquanto
                            estiver em rascunho, só você vê (HU-14).
                        </p>
                    </section>
                </aside>
            </div>
        </CascaDoApp>
    )
}

export default RegistrarSessao
