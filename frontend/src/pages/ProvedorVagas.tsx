import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { listarAutodeclaracoes, type Autodeclaracao } from '../api/autodeclaracoes'
import { listarCandidaturasDaOportunidade, type Candidatura } from '../api/candidaturas'
import { mensagemDeErro } from '../api/erros'
import { buscarOportunidade } from '../api/oportunidades'
import { convocar, naoConvocar, resumoDasVagas } from '../api/resultado'
import CascaDoApp from '../components/CascaDoApp'
import Indicadores from '../components/Indicadores'
import SeloStatus from '../components/SeloStatus'
import AcoesDaCandidatura from '../components/provedor/AcoesDaCandidatura'
import Botao, { BotaoLink } from '../components/provedor/Botao'
import Cabecalho, { Bloco } from '../components/provedor/Cabecalho'
import { avaliacoesDe, formatarNota, nomesDasOrganizacoes, notaFinal } from '../components/provedor/dados'
import { estaSuspensa, LINK_ACAO, OCUPAM_VAGA } from '../components/provedor/rotulos'
import Tabela, { Celula, Linha } from '../components/provedor/Tabela'
import { Aviso, Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { rotuloDoEstado, statusDoEstado } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_PROVEDOR } from '../navegacao/menus'

/** 33 e 73 · Provedor — resultado, vagas, reservas e lista de espera · rota /provedor/oportunidades/:id/vagas */
function ProvedorVagas() {
    const { id } = useParams()
    const oportunidadeId = Number(id)
    const [aviso, setAviso] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)
    const [ocupado, setOcupado] = useState(false)

    const { dados, carregando, erro, recarregar } = useDados(
        async () => {
            const [oportunidade, vagas, candidaturas] = await Promise.all([
                buscarOportunidade(oportunidadeId),
                resumoDasVagas(oportunidadeId),
                listarCandidaturasDaOportunidade(oportunidadeId),
            ])
            const doResultado = candidaturas.filter((c) =>
                [...OCUPAM_VAGA, 'APROVADA', 'LISTA_DE_ESPERA', 'DESISTENTE', 'NAO_CONVOCADA', 'DESCLASSIFICADA'].includes(c.estado),
            )
            const [nomes, avaliacoes] = await Promise.all([
                nomesDasOrganizacoes(doResultado.map((c) => c.organizacaoId)),
                avaliacoesDe(doResultado),
            ])
            const declaracoes = new Map<number, Autodeclaracao[]>(
                await Promise.all(
                    doResultado.map(async (c) => [c.id, await listarAutodeclaracoes(c.id).catch(() => [] as Autodeclaracao[])] as const),
                ),
            )
            return { oportunidade, vagas, candidaturas: doResultado, nomes, avaliacoes, declaracoes }
        },
        [oportunidadeId],
    )

    const nomeDe = (c: Candidatura) => dados?.nomes.get(c.organizacaoId) ?? `Organização ${c.organizacaoId}`
    const porId = (id: number) => dados?.candidaturas.find((c) => c.id === id)
    const vagaDe = (c: Candidatura) => {
        const reservada = (dados?.declaracoes.get(c.id) ?? []).find((a) => a.situacao !== 'RECUSADA')
        return reservada ? `Reservada · ${reservada.criterio}` : 'Ampla concorrência'
    }
    const suspensa = dados ? estaSuspensa(dados.oportunidade) : false

    async function agir(acao: () => Promise<unknown>, texto: string) {
        setOcupado(true)
        setAviso(null)
        try {
            await acao()
            setAviso({ tipo: 'sucesso', texto })
            await recarregar()
        } catch (e) {
            setAviso({ tipo: 'erro', texto: mensagemDeErro(e) })
        } finally {
            setOcupado(false)
        }
    }

    const ocupando = dados?.candidaturas.filter((c) => [...OCUPAM_VAGA, 'DESISTENTE'].includes(c.estado)) ?? []
    const aguardando = dados?.candidaturas.filter((c) => c.estado === 'APROVADA') ?? []
    const lista = [...(dados?.vagas.listaDeEspera ?? [])].sort((a, b) => a.posicao - b.posicao)
    const reservadas = dados?.vagas.reservas.reduce((s, r) => s + r.quantidade, 0) ?? 0

    return (
        <CascaDoApp itens={MENU_PROVEDOR} voltarPara="/provedor">
            <Cabecalho
                titulo={`Vagas · ${dados?.oportunidade.titulo ?? ''}`}
                apoio="Quem fica fora das vagas entra na lista de espera, na ordem de entrada. A convocação segue a ordem."
                acoes={<BotaoLink para={`/provedor/candidaturas?oportunidade=${oportunidadeId}`}>Ver candidaturas</BotaoLink>}
            />

            <div className="mt-6 flex flex-col gap-5">
                {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}
                {suspensa && <Aviso tipo="erro">Oportunidade pausada: a permissão de publicar foi revogada e nenhuma etapa anda.</Aviso>}
                {carregando && !dados && <Carregando />}
                {erro && <ErroNaTela mensagem={erro} tentarDeNovo={() => void recarregar()} />}

                {dados && (
                    <>
                        <Indicadores
                            rotulo="Resumo das vagas"
                            itens={[
                                { id: 'vagas', rotulo: 'Vagas', valor: dados.vagas.total === null ? 'Sem limite' : String(dados.vagas.total), cor: 'text-titulo' },
                                { id: 'reservadas', rotulo: 'Reservadas', valor: String(reservadas) },
                                { id: 'ocupadas', rotulo: 'Ocupadas', valor: String(dados.vagas.ocupadas), cor: 'text-status-aprovada-texto' },
                                { id: 'espera', rotulo: 'Lista de espera', valor: String(lista.length), cor: 'text-ocre' },
                            ]}
                        />

                        {dados.vagas.reservas.length > 0 && (
                            <Bloco titulo="Reserva de vagas">
                                <Tabela rotulo="Reservas" colunas={['Critério', 'Reservadas', 'Ocupadas']} semMoldura>
                                    {dados.vagas.reservas.map((r) => (
                                        <Linha key={r.criterio}>
                                            <Celula forte>{r.criterio}</Celula>
                                            <Celula>{r.quantidade}</Celula>
                                            <Celula>{r.ocupadas}</Celula>
                                        </Linha>
                                    ))}
                                </Tabela>
                            </Bloco>
                        )}

                        {aguardando.length > 0 && (
                            <Bloco titulo="Aprovadas aguardando homologação">
                                <Tabela rotulo="Aprovadas" colunas={['Organização', 'Nota final', 'Concorre a', 'Ações']} semMoldura>
                                    {aguardando.map((c) => (
                                        <Linha key={c.id}>
                                            <Celula forte>{nomeDe(c)}</Celula>
                                            <Celula>{formatarNota(notaFinal(dados.avaliacoes.get(c.id) ?? []))}</Celula>
                                            <Celula>{vagaDe(c)}</Celula>
                                            <Celula>
                                                <AcoesDaCandidatura
                                                    candidatura={c}
                                                    nome={nomeDe(c)}
                                                    prazoAjusteDias={null}
                                                    suspensa={suspensa}
                                                    aoMudar={async (texto) => {
                                                        setAviso({ tipo: 'sucesso', texto })
                                                        await recarregar()
                                                    }}
                                                />
                                            </Celula>
                                        </Linha>
                                    ))}
                                </Tabela>
                            </Bloco>
                        )}

                        <Bloco titulo="Ocupando vaga">
                            {ocupando.length === 0 ? (
                                <p className="text-apoio text-secundario">Nenhuma candidatura homologada ainda.</p>
                            ) : (
                                <Tabela rotulo="Ocupando vaga" colunas={['Organização', 'Nota final', 'Vaga', 'Situação', '']} semMoldura>
                                    {ocupando.map((c) => (
                                        <Linha key={c.id}>
                                            <Celula forte>
                                                <Link to={`/provedor/candidaturas/${c.id}`} className="hover:underline">
                                                    {nomeDe(c)}
                                                </Link>
                                            </Celula>
                                            <Celula>{formatarNota(notaFinal(dados.avaliacoes.get(c.id) ?? []))}</Celula>
                                            <Celula>{vagaDe(c)}</Celula>
                                            <Celula>
                                                <SeloStatus status={statusDoEstado(c.estado)} rotulo={rotuloDoEstado(c.estado)} comPonto />
                                            </Celula>
                                            <Celula>
                                                {c.estado === 'DESISTENTE' ? (
                                                    'vaga liberada'
                                                ) : (
                                                    <AcoesDaCandidatura
                                                        candidatura={c}
                                                        nome={nomeDe(c)}
                                                        prazoAjusteDias={null}
                                                        autodeclaracoes={dados.declaracoes.get(c.id)}
                                                        primeiraDaLista={
                                                            lista[0]
                                                                ? {
                                                                      candidaturaId: lista[0].candidaturaId,
                                                                      nome: (() => {
                                                                          const p = porId(lista[0].candidaturaId)
                                                                          return p ? nomeDe(p) : (lista[0].tituloProposta ?? 'a 1ª da lista')
                                                                      })(),
                                                                  }
                                                                : null
                                                        }
                                                        suspensa={suspensa}
                                                        aoMudar={async (texto) => {
                                                            setAviso({ tipo: 'sucesso', texto })
                                                            await recarregar()
                                                        }}
                                                    />
                                                )}
                                            </Celula>
                                        </Linha>
                                    ))}
                                </Tabela>
                            )}
                        </Bloco>

                        <Bloco titulo="Lista de espera">
                            {lista.length === 0 ? (
                                <Vazio titulo="Ninguém na lista de espera" />
                            ) : (
                                <Tabela rotulo="Lista de espera" colunas={['Posição', 'Organização', 'Nota final', 'Concorre a', '']} semMoldura>
                                    {lista.map((item, i) => {
                                        const c = porId(item.candidaturaId)
                                        const nome = c ? nomeDe(c) : (item.tituloProposta ?? `Candidatura ${item.candidaturaId}`)
                                        return (
                                            <Linha key={item.candidaturaId}>
                                                <Celula forte>{item.posicao}º</Celula>
                                                <Celula forte>{nome}</Celula>
                                                <Celula>{c ? formatarNota(notaFinal(dados.avaliacoes.get(c.id) ?? [])) : '—'}</Celula>
                                                <Celula>{c ? vagaDe(c) : '—'}</Celula>
                                                <Celula>
                                                    {suspensa ? (
                                                        'pausada'
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            {i === 0 ? (
                                                                <Botao
                                                                    variante="primario"
                                                                    disabled={ocupado}
                                                                    onClick={() => void agir(() => convocar(item.candidaturaId), `${nome} foi convocada.`)}
                                                                >
                                                                    Convocar
                                                                </Botao>
                                                            ) : (
                                                                <span className="self-center text-legenda text-secundario">aguardando a vez</span>
                                                            )}
                                                            <Botao
                                                                disabled={ocupado}
                                                                onClick={() =>
                                                                    void agir(() => naoConvocar(item.candidaturaId), `${nome} não foi convocada.`)
                                                                }
                                                            >
                                                                Não convocar
                                                            </Botao>
                                                        </div>
                                                    )}
                                                </Celula>
                                            </Linha>
                                        )
                                    })}
                                </Tabela>
                            )}
                            <p className="mt-3 rounded-card bg-page px-4 py-3 text-apoio text-secundario">
                                A convocação segue a ordem: só a 1ª da fila pode ser convocada. A vaga reservada que sobra volta para a
                                ampla concorrência.
                            </p>
                        </Bloco>

                        <p className="text-legenda text-secundario">
                            O mentor é convidado nas candidaturas homologadas ou em acompanhamento.{' '}
                            <Link to={`/provedor/candidaturas?oportunidade=${oportunidadeId}`} className={LINK_ACAO}>
                                Voltar às candidaturas
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </CascaDoApp>
    )
}

export default ProvedorVagas
