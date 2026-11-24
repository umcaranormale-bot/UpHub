import { useParams } from 'react-router-dom'

import { matchingDaOportunidade, pesosDoMatching } from '../api/matching'
import { buscarOportunidade } from '../api/oportunidades'
import CascaDoApp from '../components/CascaDoApp'
import SeloStatus from '../components/SeloStatus'
import { BotaoLink } from '../components/provedor/Botao'
import Cabecalho from '../components/provedor/Cabecalho'
import Tabela, { Celula, Linha } from '../components/provedor/Tabela'
import { Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { ROTULO_TIPO_ORGANIZACAO, ROTULO_TRILHA } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_PROVEDOR } from '../navegacao/menus'

/** 70 · Provedor — matching da oportunidade (quem combina com o edital) · rota /provedor/oportunidades/:id/matching */
function ProvedorMatching() {
    const { id } = useParams()
    const oportunidadeId = Number(id)

    const { dados, carregando, erro, recarregar } = useDados(
        async () => {
            const [oportunidade, ranking, pesos] = await Promise.all([
                buscarOportunidade(oportunidadeId),
                matchingDaOportunidade(oportunidadeId, 100),
                pesosDoMatching().catch(() => []),
            ])
            return { oportunidade, ranking, pesos: pesos.find((p) => p.trilhaCodigo === oportunidade.trilhaCodigo) ?? null }
        },
        [oportunidadeId],
    )

    const pesos = dados?.pesos
        ? Object.entries(dados.pesos.pesos)
              .map(([criterio, peso]) => `${criterio.toLowerCase()} ${peso}`)
              .join(', ')
        : null

    return (
        <CascaDoApp itens={MENU_PROVEDOR} voltarPara="/provedor">
            <Cabecalho
                titulo={`Matching · ${dados?.oportunidade.titulo ?? ''}`}
                apoio={`Organizações que combinam com a oportunidade, ordenadas pela compatibilidade${
                    dados ? ` · ${ROTULO_TRILHA[dados.oportunidade.trilhaCodigo]}` : ''
                }${pesos ? `: ${pesos}` : ''}`}
                acoes={<BotaoLink para={`/provedor/candidaturas?oportunidade=${oportunidadeId}`}>Ver candidaturas</BotaoLink>}
            />

            <div className="mt-6 flex flex-col gap-5">
                {carregando && !dados && <Carregando />}
                {erro && <ErroNaTela mensagem={erro} tentarDeNovo={() => void recarregar()} />}

                {dados && dados.ranking.length === 0 && (
                    <Vazio titulo="Nenhuma organização combina ainda">
                        As inelegíveis não aparecem. Assim que houver organizações do tipo da trilha que atendem às regras, elas entram aqui.
                    </Vazio>
                )}

                {dados && dados.ranking.length > 0 && (
                    <Tabela
                        rotulo="Organizações que combinam"
                        colunas={['Organização', 'Tipo', 'Compatibilidade', 'Elegibilidade', 'O que mais pesou', 'Situação']}
                    >
                        {dados.ranking.map((m) => {
                            const principal = [...m.motivos].sort((a, b) => b.pontos - a.pontos)[0]
                            return (
                                <Linha key={m.organizacaoId}>
                                    <Celula forte>{m.organizacaoNome}</Celula>
                                    <Celula>{ROTULO_TIPO_ORGANIZACAO[m.organizacaoTipo] ?? m.organizacaoTipo}</Celula>
                                    <Celula>
                                        <span className="flex items-center gap-2">
                                            <span
                                                className="h-1.5 w-16 overflow-hidden rounded-full bg-sutil"
                                                role="meter"
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                                aria-valuenow={m.compatibilidade}
                                                aria-label={`Compatibilidade de ${m.organizacaoNome}`}
                                            >
                                                <span className="block h-full bg-acento" style={{ width: `${m.compatibilidade}%` }} />
                                            </span>
                                            <span className="text-item text-acento">{m.compatibilidade}</span>
                                        </span>
                                    </Celula>
                                    <Celula>
                                        <SeloStatus
                                            status={m.elegibilidade === 'ELEGIVEL' ? 'aprovada' : 'pendente'}
                                            rotulo={m.elegibilidade === 'ELEGIVEL' ? 'Elegível' : 'Pendente'}
                                            comPonto
                                        />
                                    </Celula>
                                    <Celula>
                                        {principal ? `${principal.criterio}: ${principal.explicacao}` : '—'}
                                        {m.motivos.length > 1 && (
                                            <details className="mt-1">
                                                <summary className="cursor-pointer text-legenda text-acento">Ver todos os motivos</summary>
                                                <ul className="mt-1 flex flex-col gap-1">
                                                    {m.motivos.map((mo) => (
                                                        <li key={mo.criterio} className="text-legenda">
                                                            <span className="text-titulo">
                                                                {mo.criterio} · {mo.pontos} de {mo.peso}
                                                            </span>{' '}
                                                            — {mo.explicacao}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </details>
                                        )}
                                    </Celula>
                                    <Celula>
                                        <SeloStatus
                                            status={m.jaSeCandidatou ? 'enviada' : 'rascunho'}
                                            rotulo={m.jaSeCandidatou ? 'Candidatou-se' : 'Não se candidatou'}
                                            comPonto
                                        />
                                    </Celula>
                                </Linha>
                            )
                        })}
                    </Tabela>
                )}

                <p className="rounded-card bg-page px-5 py-3 text-apoio text-secundario">
                    Inelegíveis não aparecem; pendentes entram com metade dos pontos de elegibilidade. A nota é uma ajuda para
                    convidar e priorizar: a decisão continua sendo da avaliação por critérios.
                </p>
            </div>
        </CascaDoApp>
    )
}

export default ProvedorMatching
