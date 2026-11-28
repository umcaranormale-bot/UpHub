import type { ReactNode } from 'react'
import { useParams } from 'react-router-dom'

import { listarCriterios } from '../api/criterios'
import { listarDocumentosExigidos } from '../api/documentosExigidos'
import { buscarOportunidade } from '../api/oportunidades'
import { listarRequisitos } from '../api/requisitos'
import { listarReservas } from '../api/reservas'
import CascaDoApp from '../components/CascaDoApp'
import { formatarValor, rotuloDoCampo, rotuloDoOperador, talvez, versaoPublicada } from '../components/candidato/apoio'
import { LinhaDeLista, Secao } from '../components/candidato/Blocos'
import { CustomButton } from '../components/CustomButton'
import SeloDeTrilha from '../components/SeloDeTrilha'
import SeloStatus from '../components/SeloStatus'
import { Carregando, ErroNaTela } from '../components/ui/Estados'
import { CARTAO_COM_RESPIRO } from '../estilos/classes'
import { formatarData, ROTULO_TRILHA, trilhaDoSelo } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_PROVEDOR } from '../navegacao/menus'

/**
 * Provedor — a oportunidade publicada · rota /provedor/oportunidades/:id
 *
 * O que vale na versão publicada: a tese (Investimento), os requisitos de
 * elegibilidade, os documentos exigidos, os critérios com peso, as vagas e as
 * reservas. As regras ficam presas à versão: depois de publicada, só o prazo
 * muda. Daqui saem o Matching, o Funil (Investimento) e as Vagas.
 */
const ESTADO_DA_OPORTUNIDADE: Record<string, string> = {
    RASCUNHO: 'Rascunho',
    PUBLICADA: 'Publicada',
    EM_AVALIACAO: 'Em avaliação',
    ENCERRADA: 'Encerrada',
}

export default function ProvedorOportunidade() {
    const oportunidadeId = Number(useParams().id)

    const { dados, carregando, erro, recarregar } = useDados(async () => {
        const [oportunidade, versao] = await Promise.all([buscarOportunidade(oportunidadeId), versaoPublicada(oportunidadeId)])
        const [requisitos, documentos, criterios, reservas] = versao
            ? await Promise.all([
                  talvez(listarRequisitos(oportunidadeId, versao.id)),
                  talvez(listarDocumentosExigidos(oportunidadeId, versao.id)),
                  talvez(listarCriterios(oportunidadeId, versao.id)),
                  talvez(listarReservas(oportunidadeId, versao.id)),
              ])
            : [null, null, null, null]
        return { oportunidade, versao, requisitos, documentos, criterios, reservas }
    }, [oportunidadeId])

    if (carregando) {
        return (
            <CascaDoApp itens={MENU_PROVEDOR} voltarPara="/provedor">
                <Carregando />
            </CascaDoApp>
        )
    }
    if (erro || !dados) {
        return (
            <CascaDoApp itens={MENU_PROVEDOR} voltarPara="/provedor">
                <ErroNaTela mensagem={erro ?? 'Não foi possível abrir a oportunidade.'} tentarDeNovo={() => void recarregar()} />
            </CascaDoApp>
        )
    }

    const { oportunidade, versao, requisitos, documentos, criterios, reservas } = dados
    const trilha = oportunidade.trilhaCodigo
    const somaDosPesos = criterios?.ok ? criterios.valor.reduce((t, c) => t + (c.peso ?? 0), 0) : 0

    return (
        <CascaDoApp itens={MENU_PROVEDOR} voltarPara="/provedor">
            <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <SeloDeTrilha trilha={trilhaDoSelo(trilha)} />
                        <SeloStatus
                            status={oportunidade.estado === 'PUBLICADA' ? 'aprovada' : oportunidade.estado === 'RASCUNHO' ? 'rascunho' : 'pendente'}
                            rotulo={ESTADO_DA_OPORTUNIDADE[oportunidade.estado] ?? oportunidade.estado}
                        />
                        {oportunidade.area && <span className="text-apoio text-secundario">área: {oportunidade.area}</span>}
                    </div>
                    <h1 className="mt-2 font-display text-tela text-titulo">{oportunidade.titulo}</h1>
                    <p className="mt-1 text-apoio text-secundario">
                        {ROTULO_TRILHA[trilha]}
                        {versao && ` · versão ${versao.numero}, publicada · inscrições até ${formatarData(versao.prazoEnvio)}`}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <CustomButton to={`/provedor/oportunidades/${oportunidadeId}/matching`} variant="aprovar" size="auto">
                        Matching
                    </CustomButton>
                    {trilha === 'INVESTIMENTO' && (
                        <CustomButton to={`/provedor/oportunidades/${oportunidadeId}/funil`} variant="neutro" size="auto">
                            Funil
                        </CustomButton>
                    )}
                    <CustomButton to={`/provedor/candidaturas?oportunidade=${oportunidadeId}`} variant="neutro" size="auto">
                        Candidaturas
                    </CustomButton>
                    <CustomButton to={`/provedor/oportunidades/${oportunidadeId}/vagas`} variant="neutro" size="auto">
                        Vagas
                    </CustomButton>
                </div>
            </div>

            <p className="mt-4 rounded-card border border-sutil bg-page p-4 text-apoio text-secundario">
                As regras ficam presas à versão publicada: depois de publicada, só o nome e o prazo de envio mudam, e quem já se
                candidatou continua julgado pelas mesmas regras.
            </p>

            <div className="mt-6 flex flex-col items-start gap-6 lg:flex-row">
                <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
                    {(oportunidade.resumo || oportunidade.tese || versao?.escopo) && (
                        <Secao titulo="Sobre a oportunidade">
                            <dl className="flex flex-col gap-4">
                                {oportunidade.tese && (
                                    <Item rotulo="Tese de investimento (pesa 40 de 100 no matching)">{oportunidade.tese}</Item>
                                )}
                                {oportunidade.resumo && <Item rotulo="Resumo">{oportunidade.resumo}</Item>}
                                {versao?.escopo && <Item rotulo="Escopo">{versao.escopo}</Item>}
                                {versao?.entregaveis && <Item rotulo="Entregáveis">{versao.entregaveis}</Item>}
                            </dl>
                        </Secao>
                    )}

                    <Secao
                        titulo="Requisitos de elegibilidade"
                        subtitulo="O motor de elegibilidade confere cada regra no envio da candidatura."
                        semRespiro
                    >
                        {!versao ? (
                            <p className="p-card text-apoio text-secundario">Esta oportunidade ainda não tem versão publicada.</p>
                        ) : !requisitos?.ok ? (
                            <p className="p-card text-apoio text-secundario">Não foi possível ler os requisitos.</p>
                        ) : requisitos.valor.length === 0 ? (
                            <p className="p-card text-apoio text-secundario">Sem requisitos de elegibilidade.</p>
                        ) : (
                            <ul>
                                {requisitos.valor.map((r) => (
                                    <LinhaDeLista
                                        key={r.id}
                                        titulo={rotuloDoCampo(r.campo)}
                                        apoio={`${rotuloDoOperador(r.operador)} ${formatarValor(r.valor)}`}
                                    >
                                        <SeloStatus
                                            status={r.obrigatoria ? 'pendente' : 'rascunho'}
                                            rotulo={r.obrigatoria ? 'Obrigatória' : 'Desejável'}
                                        />
                                    </LinhaDeLista>
                                ))}
                            </ul>
                        )}
                    </Secao>

                    {versao && (
                        <Secao titulo="Documentos exigidos" subtitulo="O envio é recusado se faltar um obrigatório ou se um anexo estiver vencido." semRespiro>
                            {!documentos?.ok || documentos.valor.length === 0 ? (
                                <p className="p-card text-apoio text-secundario">Esta oportunidade não exige documentos.</p>
                            ) : (
                                <ul>
                                    {documentos.valor.map((d) => (
                                        <LinhaDeLista key={d.id} titulo={d.nome}>
                                            <SeloStatus
                                                status={d.obrigatorio ? 'pendente' : 'rascunho'}
                                                rotulo={d.obrigatorio ? 'Obrigatório' : 'Opcional'}
                                            />
                                        </LinhaDeLista>
                                    ))}
                                </ul>
                            )}
                        </Secao>
                    )}

                    {versao && (
                        <Secao
                            titulo="Critérios de avaliação"
                            subtitulo="Nota de 0 a 10 por critério; a nota final é a média ponderada, de 0 a 100."
                            semRespiro
                        >
                            {!criterios?.ok || criterios.valor.length === 0 ? (
                                <p className="p-card text-apoio text-secundario">Sem critérios de avaliação.</p>
                            ) : (
                                <ul>
                                    {criterios.valor.map((c) => (
                                        <LinhaDeLista
                                            key={c.id}
                                            titulo={c.descricao}
                                            apoio={c.evidenciaEsperada ?? `escala de ${c.escalaMin ?? 0} a ${c.escalaMax ?? 10}`}
                                        >
                                            <span className="text-apoio text-titulo">
                                                peso {c.peso ?? 0}
                                                {somaDosPesos > 0 && ` (${Math.round(((c.peso ?? 0) / somaDosPesos) * 100)}%)`}
                                            </span>
                                        </LinhaDeLista>
                                    ))}
                                </ul>
                            )}
                        </Secao>
                    )}
                </div>

                {versao && (
                    <aside className="flex w-full shrink-0 flex-col gap-5 lg:w-[344px]">
                        <section className={CARTAO_COM_RESPIRO}>
                            <h2 className="font-display text-bloco text-titulo">Regras da versão publicada</h2>
                            <dl className="mt-3 flex flex-col gap-3">
                                <Item rotulo="Prazo de envio">{formatarData(versao.prazoEnvio)}</Item>
                                <Item rotulo="Vagas">{versao.quantidadeVagas ? `${versao.quantidadeVagas} vagas` : 'Sem limite de vagas'}</Item>
                                <Item rotulo="Prazo para ajuste">{versao.prazoAjusteDias} dias, no máximo 2 pedidos</Item>
                                {versao.cargaSemanalHoras !== null && <Item rotulo="Carga semanal">{versao.cargaSemanalHoras} horas</Item>}
                                {versao.duracaoSemanas !== null && <Item rotulo="Duração">{versao.duracaoSemanas} semanas</Item>}
                            </dl>
                        </section>
                        {reservas?.ok && reservas.valor.length > 0 && (
                            <section className={CARTAO_COM_RESPIRO}>
                                <h2 className="font-display text-bloco text-titulo">Vagas reservadas</h2>
                                <ul className="mt-3 flex flex-col gap-2">
                                    {reservas.valor.map((r) => (
                                        <li key={r.id} className="flex items-center justify-between gap-3 text-apoio">
                                            <span className="text-titulo">{r.criterio}</span>
                                            <span className="text-secundario">
                                                {r.quantidade} {r.quantidade === 1 ? 'vaga' : 'vagas'}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-3 text-legenda text-secundario">
                                    A autodeclaração é conferida só pelo provedor. O avaliador nunca a vê.
                                </p>
                            </section>
                        )}
                    </aside>
                )}
            </div>
        </CascaDoApp>
    )
}

function Item({ rotulo, children }: { rotulo: string; children: ReactNode }) {
    return (
        <div>
            <dt className="text-legenda text-secundario">{rotulo}</dt>
            <dd className="mt-1 whitespace-pre-line text-apoio text-titulo">{children}</dd>
        </div>
    )
}
