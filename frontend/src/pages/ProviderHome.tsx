import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { mensagemDeErro } from '../api/erros'
import { editarVersao } from '../api/versoes'
import AbasDeFiltro, { type Aba } from '../components/AbasDeFiltro'
import CascaDoApp from '../components/CascaDoApp'
import { CustomButton } from '../components/CustomButton'
import SeloDeTrilha from '../components/SeloDeTrilha'
import SeloStatus from '../components/SeloStatus'
import Botao from '../components/provedor/Botao'
import Cabecalho from '../components/provedor/Cabecalho'
import { carregarPainel, ultimoPedido, type OportunidadeDoPainel } from '../components/provedor/dados'
import { estaSuspensa, LINK_ACAO, rotuloDaOportunidade, statusDaOportunidade } from '../components/provedor/rotulos'
import Tabela, { Celula, Linha } from '../components/provedor/Tabela'
import { Campo } from '../components/ui/Campo'
import { Aviso, Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import Modal from '../components/ui/Modal'
import { formatarData, hoje, trilhaDoSelo } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_PROVEDOR } from '../navegacao/menus'
import { useSessao } from '../sessao/contexto'

/** 02 e 02b · Provedor — painel de oportunidades (e o aviso das suspensas) · rota /provedor */

type Filtro = 'TODAS' | 'RASCUNHO' | 'PUBLICADA' | 'EM_AVALIACAO' | 'ENCERRADA'

function ProviderHome() {
    const { perfilAtivo, pessoa } = useSessao()
    const organizacaoId = perfilAtivo?.vinculo.organizacaoId
    const local = useLocation()
    const avisoRecebido = (local.state as { aviso?: string } | null)?.aviso

    const { dados, carregando, erro, recarregar } = useDados(
        async () => {
            const [linhas, pedido] = await Promise.all([
                carregarPainel(organizacaoId!),
                ultimoPedido(organizacaoId!).catch(() => null),
            ])
            return { linhas, pedido }
        },
        [organizacaoId],
        !!organizacaoId,
    )

    const [filtro, setFiltro] = useState<Filtro>('TODAS')
    const [editando, setEditando] = useState<OportunidadeDoPainel | null>(null)
    const [aviso, setAviso] = useState<string | null>(null)

    const linhas = dados?.linhas ?? []
    const suspensas = linhas.filter((l) => estaSuspensa(l.oportunidade))
    const contar = (estado: Filtro) => linhas.filter((l) => estado === 'TODAS' || l.oportunidade.estado === estado).length
    const abas: Aba<Filtro>[] = [
        { id: 'TODAS', rotulo: 'Todas', quantidade: contar('TODAS') },
        { id: 'RASCUNHO', rotulo: 'Rascunho', quantidade: contar('RASCUNHO') },
        { id: 'PUBLICADA', rotulo: 'Publicada', quantidade: contar('PUBLICADA') },
        { id: 'EM_AVALIACAO', rotulo: 'Em avaliação', quantidade: contar('EM_AVALIACAO') },
        { id: 'ENCERRADA', rotulo: 'Encerrada', quantidade: contar('ENCERRADA') },
    ]
    const visiveis = linhas.filter((l) => filtro === 'TODAS' || l.oportunidade.estado === filtro)
    const semAvaliador = linhas.filter(
        (l) =>
            (l.oportunidade.estado === 'PUBLICADA' || l.oportunidade.estado === 'EM_AVALIACAO') &&
            l.avaliadores.length === 0 &&
            l.candidaturas.length > 0,
    )
    const pedido = dados?.pedido ?? null
    const podePublicar = pedido?.situacao === 'APROVADA'
    const primeiroNome = pessoa?.nome.split(' ')[0]

    return (
        <CascaDoApp itens={MENU_PROVEDOR}>
            <Cabecalho
                titulo="Minhas oportunidades"
                apoio={
                    pedido?.situacao === 'REVOGADA'
                        ? `${primeiroNome ?? ''} · permissão de publicar revogada em ${formatarData(pedido.revogadaEm)}`
                        : `${perfilAtivo?.vinculo.organizacaoNome ?? ''} · as oportunidades que a organização publica e conduz`
                }
                acoes={
                    <CustomButton to="/provedor/oportunidades/nova" size="auto">
                        Criar oportunidade
                    </CustomButton>
                }
            />

            <div className="mt-6 flex flex-col gap-5">
                {avisoRecebido && !aviso && <Aviso tipo="sucesso">{avisoRecebido}</Aviso>}
                {aviso && <Aviso tipo="sucesso">{aviso}</Aviso>}

                {suspensas.length > 0 && (
                    <section
                        role="alert"
                        className="rounded-card border border-status-reprovada-borda bg-status-reprovada-fundo p-5"
                    >
                        <p className="text-bloco text-status-reprovada-texto">
                            Suas oportunidades estão suspensas desde {formatarData(suspensas[0].oportunidade.suspensaEm)}
                        </p>
                        <p className="mt-1 text-apoio text-titulo">
                            A permissão de publicar foi revogada. As oportunidades não recebem candidaturas, e as candidaturas já
                            enviadas estão pausadas: nenhuma etapa anda. Tudo volta do ponto em que parou quando a gestão aprovar o
                            novo pedido.
                        </p>
                        <Link to="/provedor/pedido" className={`mt-2 inline-block ${LINK_ACAO}`}>
                            Pedir a permissão de novo
                        </Link>
                    </section>
                )}

                {dados && !podePublicar && suspensas.length === 0 && (
                    <section className="flex flex-wrap items-center gap-4 rounded-card border border-aviso-borda bg-aviso-fundo p-5">
                        <p className="min-w-0 flex-1 text-apoio text-ocre">
                            {pedido?.situacao === 'AGUARDANDO'
                                ? 'O pedido de permissão está com a gestão do Porto Digital. Você já pode montar rascunhos; publicar fica liberado quando o pedido for aprovado.'
                                : 'A organização ainda não tem permissão para publicar. Você pode montar rascunhos, mas só publica depois que a gestão aprovar o pedido.'}
                        </p>
                        <Link to="/provedor/pedido" className={LINK_ACAO}>
                            Ver o pedido de permissão
                        </Link>
                    </section>
                )}

                {carregando && !dados && <Carregando />}
                {erro && <ErroNaTela mensagem={erro} tentarDeNovo={() => void recarregar()} />}

                {dados && linhas.length === 0 && (
                    <Vazio titulo="Nenhuma oportunidade ainda">
                        Crie a primeira: ela nasce como rascunho e você completa prazos, critérios e regras antes de publicar.
                    </Vazio>
                )}

                {dados && linhas.length > 0 && (
                    <>
                        <AbasDeFiltro abas={abas} ativa={filtro} aoEscolher={setFiltro} rotulo="Filtrar por estado" />

                        {visiveis.length === 0 ? (
                            <Vazio titulo="Nenhuma oportunidade neste estado" />
                        ) : (
                            <Tabela
                                rotulo="Oportunidades da organização"
                                colunas={['Oportunidade', 'Trilha', 'Prazo', 'Candidaturas', 'Avaliador', 'Status', 'Atalhos']}
                            >
                                {visiveis.map((linha) => (
                                    <LinhaDaOportunidade
                                        key={linha.oportunidade.id}
                                        linha={linha}
                                        aoEditar={() => {
                                            setAviso(null)
                                            setEditando(linha)
                                        }}
                                    />
                                ))}
                            </Tabela>
                        )}

                        {semAvaliador.map((l) => (
                            <section
                                key={l.oportunidade.id}
                                className="flex flex-wrap items-center gap-3 rounded-card border border-sutil bg-card p-4"
                            >
                                <span className="rounded-badge bg-aviso-fundo px-2 py-1 text-selo text-ocre">Gargalo</span>
                                <p className="min-w-0 flex-1 text-apoio text-secundario">
                                    {l.oportunidade.titulo} está sem avaliador designado: as {l.candidaturas.length} candidaturas
                                    ficam paradas até alguém avaliar.
                                </p>
                                <Link to={`/provedor/avaliadores?oportunidade=${l.oportunidade.id}`} className={LINK_ACAO}>
                                    Designar avaliador
                                </Link>
                            </section>
                        ))}

                        <p className="text-legenda text-secundario">
                            Depois de publicada, a oportunidade só muda o prazo de envio. Critérios, pesos, requisitos, vagas e
                            reservas ficam congelados, e quem já se candidatou continua julgado pelas mesmas regras.
                        </p>
                    </>
                )}
            </div>

            {editando && (
                <ModalEditarPublicada
                    key={editando.oportunidade.id}
                    linha={editando}
                    aoFechar={() => setEditando(null)}
                    aoSalvar={async (mensagem) => {
                        setEditando(null)
                        setAviso(mensagem)
                        await recarregar()
                    }}
                />
            )}
        </CascaDoApp>
    )
}

function LinhaDaOportunidade({ linha, aoEditar }: { linha: OportunidadeDoPainel; aoEditar: () => void }) {
    const { oportunidade: o, versao, candidaturas, avaliadores } = linha
    const publicada = o.estado !== 'RASCUNHO'
    const prazo =
        o.estado === 'ENCERRADA'
            ? `encerrada em ${formatarData(o.encerradaEm)}`
            : versao?.prazoEnvio
              ? formatarData(versao.prazoEnvio)
              : '—'

    return (
        <Linha>
            <Celula forte>
                {publicada ? (
                    <Link to={`/provedor/oportunidades/${o.id}`} className={`text-titulo hover:underline`}>
                        {o.titulo}
                    </Link>
                ) : (
                    o.titulo
                )}
            </Celula>
            <Celula>
                <SeloDeTrilha trilha={trilhaDoSelo(o.trilhaCodigo)} />
            </Celula>
            <Celula>{prazo}</Celula>
            <Celula>{publicada ? candidaturas.length : '—'}</Celula>
            <Celula>
                {avaliadores.length > 0 ? (
                    avaliadores.map((a) => a.nome).join(', ')
                ) : publicada ? (
                    <span className="text-ocre">— não designado</span>
                ) : (
                    '—'
                )}
            </Celula>
            <Celula>
                <SeloStatus status={statusDaOportunidade(o)} rotulo={rotuloDaOportunidade(o)} />
            </Celula>
            <Celula>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {!publicada && (
                        <Link to={`/provedor/oportunidades/${o.id}/editar`} className={LINK_ACAO}>
                            Continuar rascunho
                        </Link>
                    )}
                    {publicada && (
                        <>
                            <Link to={`/provedor/oportunidades/${o.id}/matching`} className={LINK_ACAO}>
                                Matching
                            </Link>
                            {o.trilhaCodigo === 'INVESTIMENTO' && (
                                <Link to={`/provedor/oportunidades/${o.id}/funil`} className={LINK_ACAO}>
                                    Funil
                                </Link>
                            )}
                            <Link to={`/provedor/oportunidades/${o.id}/vagas`} className={LINK_ACAO}>
                                Vagas
                            </Link>
                            <Link to={`/provedor/avaliadores?oportunidade=${o.id}`} className={LINK_ACAO}>
                                Avaliadores
                            </Link>
                        </>
                    )}
                    <Link to={`/provedor/auditoria?oportunidade=${o.id}`} className={LINK_ACAO}>
                        Auditoria
                    </Link>
                    {publicada && o.estado !== 'ENCERRADA' && versao?.publicada && (
                        <button type="button" onClick={aoEditar} className={LINK_ACAO}>
                            Editar prazo
                        </button>
                    )}
                </div>
            </Celula>
        </Linha>
    )
}

/**
 * Modal · editar oportunidade publicada. Na API, depois de publicada só o prazo
 * de envio muda (título e resumo ficam congelados junto com a versão).
 */
function ModalEditarPublicada({
    linha,
    aoFechar,
    aoSalvar,
}: {
    linha: OportunidadeDoPainel
    aoFechar: () => void
    aoSalvar: (mensagem: string) => Promise<void>
}) {
    const atual = linha.versao?.prazoEnvio ?? null
    const [prazo, setPrazo] = useState(atual ?? '')
    const [erro, setErro] = useState<string | null>(null)
    const [salvando, setSalvando] = useState(false)

    const minimo = atual && atual > hoje() ? atual : hoje()
    const prorrogou = !!prazo && (!atual || prazo > atual)

    async function salvar() {
        if (!linha.versao) return
        setSalvando(true)
        setErro(null)
        try {
            await editarVersao(linha.oportunidade.id, linha.versao.id, { prazoEnvio: prazo })
            await aoSalvar(`Prazo de envio de ${linha.oportunidade.titulo} prorrogado para ${formatarData(prazo)}.`)
        } catch (e) {
            setErro(mensagemDeErro(e))
        } finally {
            setSalvando(false)
        }
    }

    return (
        <Modal
            aberto
            titulo={`Editar ${linha.oportunidade.titulo} depois de publicada?`}
            descricao="Depois de publicada, só o prazo de envio muda, e ele só pode ser prorrogado. Título, resumo, critérios, pesos, requisitos, vagas e reservas ficam congelados."
            aoFechar={aoFechar}
            acoes={
                <>
                    <Botao onClick={aoFechar}>Cancelar</Botao>
                    <Botao variante="primario" onClick={() => void salvar()} disabled={!prorrogou || salvando}>
                        {salvando ? 'Salvando…' : 'Salvar alteração'}
                    </Botao>
                </>
            }
        >
            <Campo
                rotulo="Novo prazo de envio"
                type="date"
                min={minimo}
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
                ajuda={atual ? `O prazo atual é ${formatarData(atual)}. A mudança entra no histórico de auditoria.` : undefined}
            />
            {erro && <Aviso tipo="erro">{erro}</Aviso>}
        </Modal>
    )
}

export default ProviderHome
