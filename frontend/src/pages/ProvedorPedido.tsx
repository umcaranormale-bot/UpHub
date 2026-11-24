import { useState } from 'react'
import { Link } from 'react-router-dom'

import { cadastrarDocumento, listarDocumentos, type Documento } from '../api/documentos'
import { mensagemDeErro } from '../api/erros'
import { listarPedidos, pedirPermissao, type Solicitacao } from '../api/solicitacoesProvedor'
import CascaDoApp from '../components/CascaDoApp'
import SeloStatus from '../components/SeloStatus'
import Botao from '../components/provedor/Botao'
import Cabecalho, { Bloco } from '../components/provedor/Cabecalho'
import { LINK_ACAO, ROTULO_PEDIDO, STATUS_PEDIDO } from '../components/provedor/rotulos'
import { Campo, CampoLista, CampoTexto } from '../components/ui/Campo'
import { Aviso, Carregando, ErroNaTela } from '../components/ui/Estados'
import { formatarData, formatarDataHora } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_PROVEDOR } from '../navegacao/menus'
import { useSessao } from '../sessao/contexto'

/**
 * 47, 47b e 47c · Provedor — pedido de permissão para publicar · rota /provedor/pedido
 *
 * Uma página, cinco situações: nunca pediu, aguardando, aprovado, recusado e
 * revogado. Depois da recusa ou da revogação, o pedido novo responde ao motivo.
 */

const TIPO_DOCUMENTO = 'COMPROVACAO_PROVEDOR'

function ProvedorPedido() {
    const { perfilAtivo } = useSessao()
    const organizacaoId = perfilAtivo?.vinculo.organizacaoId

    const { dados, carregando, erro, recarregar } = useDados(
        async () => {
            const [pedidos, documentos] = await Promise.all([
                listarPedidos(organizacaoId!),
                listarDocumentos(organizacaoId!).catch(() => [] as Documento[]),
            ])
            return {
                pedidos: [...pedidos].sort((a, b) => b.pedidaEm.localeCompare(a.pedidaEm)),
                documentos,
            }
        },
        [organizacaoId],
        !!organizacaoId,
    )
    const [aviso, setAviso] = useState<string | null>(null)

    const pedidos = dados?.pedidos ?? []
    const ultimo = pedidos[0] ?? null
    const documentos = dados?.documentos ?? []
    const nomeDoDocumento = (id: number | null) => documentos.find((d) => d.id === id)?.nomeArquivo ?? null

    return (
        <CascaDoApp itens={MENU_PROVEDOR} voltarPara="/provedor">
            <Cabecalho
                titulo="Pedido de publicação"
                apoio={`${perfilAtivo?.vinculo.organizacaoNome ?? ''} · a gestão do Porto Digital confere os dados antes de liberar a publicação de oportunidades`}
                acoes={
                    ultimo && (
                        <SeloStatus status={STATUS_PEDIDO[ultimo.situacao]} rotulo={ROTULO_PEDIDO[ultimo.situacao]} comPonto />
                    )
                }
            />

            <div className="mt-6 flex flex-col gap-5">
                {aviso && <Aviso tipo="sucesso">{aviso}</Aviso>}
                {carregando && !dados && <Carregando />}
                {erro && <ErroNaTela mensagem={erro} tentarDeNovo={() => void recarregar()} />}

                {dados && (
                    <>
                        <Faixa ultimo={ultimo} />

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                            <div className="flex min-w-0 flex-1 flex-col gap-5">
                                {(!ultimo || ultimo.situacao === 'RECUSADA' || ultimo.situacao === 'REVOGADA') &&
                                    organizacaoId && (
                                        <FormularioDoPedido
                                            key={ultimo?.id ?? 0}
                                            organizacaoId={organizacaoId}
                                            anterior={ultimo}
                                            documentos={documentos}
                                            aoEnviar={async () => {
                                                setAviso(
                                                    'Pedido enviado. Ele entrou na fila de aprovação da gestão; a resposta chega por e-mail e em Notificações e prazos.',
                                                )
                                                await recarregar()
                                            }}
                                        />
                                    )}

                                {ultimo && (ultimo.situacao === 'AGUARDANDO' || ultimo.situacao === 'APROVADA') && (
                                    <Bloco
                                        titulo="Seu pedido"
                                        apoio={`${pedidos.length}º pedido · enviado em ${formatarData(ultimo.pedidaEm)} por ${ultimo.solicitanteNome}`}
                                    >
                                        <dl className="flex flex-col gap-3">
                                            <Dado rotulo="E-mail institucional" valor={ultimo.emailInstitucional} />
                                            <Dado
                                                rotulo="Comprovação da organização"
                                                valor={nomeDoDocumento(ultimo.documentoId) ?? 'Nenhum documento enviado'}
                                            />
                                            {ultimo.respostaRecusa && (
                                                <Dado rotulo="Resposta ao pedido anterior" valor={ultimo.respostaRecusa} />
                                            )}
                                        </dl>
                                        {ultimo.situacao === 'AGUARDANDO' && (
                                            <p className="mt-4 text-legenda text-secundario">
                                                Enquanto este pedido estiver aguardando, não é possível abrir outro.
                                            </p>
                                        )}
                                    </Bloco>
                                )}
                            </div>

                            <aside className="flex w-full shrink-0 lg:w-[344px] flex-col gap-5">
                                <Bloco titulo="Histórico de pedidos">
                                    {pedidos.length === 0 ? (
                                        <p className="text-apoio text-secundario">Nenhum pedido ainda.</p>
                                    ) : (
                                        <ul className="flex flex-col divide-y divide-sutil rounded-card border border-sutil">
                                            {pedidos.map((p, i) => (
                                                <li key={p.id} className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="min-w-0 flex-1 text-item text-titulo">
                                                            {pedidos.length - i}º pedido · {formatarData(p.pedidaEm)}
                                                        </span>
                                                        <SeloStatus status={STATUS_PEDIDO[p.situacao]} rotulo={ROTULO_PEDIDO[p.situacao]} />
                                                    </div>
                                                    <p className="mt-1 text-legenda text-secundario">{resumoDoPedido(p)}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </Bloco>

                                <Bloco titulo="Enquanto isso">
                                    <p className="text-apoio text-titulo">
                                        {ultimo?.situacao === 'REVOGADA'
                                            ? 'Sua conta continua ativa. Suas oportunidades estão suspensas: não recebem candidaturas, e as que já chegaram estão pausadas. Tudo volta do ponto em que parou quando a gestão aprovar o novo pedido.'
                                            : 'Sua conta continua ativa: você navega pelo Up Hub e monta rascunhos, mas só publica oportunidades depois que a gestão aprovar o pedido.'}
                                    </p>
                                </Bloco>
                            </aside>
                        </div>
                    </>
                )}
            </div>
        </CascaDoApp>
    )
}

function resumoDoPedido(p: Solicitacao): string {
    switch (p.situacao) {
        case 'AGUARDANDO':
            return p.solicitacaoAnteriorId ? 'Responde ao pedido anterior' : 'Na fila da gestão'
        case 'APROVADA':
            return `Aprovado em ${formatarData(p.decididaEm)}`
        case 'RECUSADA':
            return `Motivo: ${p.motivo ?? '—'}`
        case 'REVOGADA':
            return `Revogado em ${formatarData(p.revogadaEm)} · ${p.motivoRevogacao ?? '—'}`
    }
}

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
    return (
        <div>
            <dt className="text-apoio text-secundario">{rotulo}</dt>
            <dd className="mt-1 rounded-card border border-sutil px-3 py-2 text-corpo text-titulo">{valor}</dd>
        </div>
    )
}

/** A faixa colorida do topo, conforme a situação do último pedido. */
function Faixa({ ultimo }: { ultimo: Solicitacao | null }) {
    if (!ultimo) {
        return (
            <p className="rounded-card border border-sutil bg-acento-suave px-5 py-4 text-apoio text-titulo">
                Para publicar oportunidades, a organização precisa da permissão da gestão do Porto Digital. Informe o e-mail
                institucional e, se tiver, um documento que comprove o vínculo com a organização.
            </p>
        )
    }
    if (ultimo.situacao === 'AGUARDANDO') {
        return (
            <section className="rounded-card bg-acento-suave px-5 py-4">
                <p className="text-bloco text-acento">Seu pedido está com a gestão</p>
                <p className="mt-1 text-apoio text-titulo">
                    Enviado em {formatarData(ultimo.pedidaEm)}
                    {ultimo.solicitacaoAnteriorId ? ', em resposta ao pedido anterior,' : ''} e na fila de aprovação de
                    provedores. A resposta chega por e-mail e em Notificações e prazos.
                </p>
            </section>
        )
    }
    if (ultimo.situacao === 'APROVADA') {
        return (
            <section className="rounded-card border border-status-aprovada-borda bg-status-aprovada-fundo px-5 py-4">
                <p className="text-bloco text-status-aprovada-texto">Permissão aprovada em {formatarData(ultimo.decididaEm)}</p>
                <p className="mt-1 text-apoio text-titulo">A organização já pode publicar oportunidades.</p>
                <Link to="/provedor" className={`mt-2 inline-block ${LINK_ACAO}`}>
                    Ir para o painel
                </Link>
            </section>
        )
    }
    const revogada = ultimo.situacao === 'REVOGADA'
    return (
        <section role="alert" className="rounded-card border border-status-reprovada-borda bg-status-reprovada-fundo px-5 py-4">
            <p className="text-bloco text-status-reprovada-texto">
                {revogada
                    ? `Sua permissão de publicar foi revogada em ${formatarData(ultimo.revogadaEm)}`
                    : `Seu pedido foi recusado em ${formatarData(ultimo.decididaEm)}`}
            </p>
            <p className="mt-1 text-apoio text-titulo">
                Motivo: {revogada ? ultimo.motivoRevogacao : ultimo.motivo}
            </p>
            {!revogada && ultimo.recusaPorDocumento && (
                <span className="mt-2 inline-block rounded-badge bg-card px-2 py-1 text-selo text-status-reprovada-texto">
                    Recusa por documento
                </span>
            )}
        </section>
    )
}

function FormularioDoPedido({
    organizacaoId,
    anterior,
    documentos,
    aoEnviar,
}: {
    organizacaoId: number
    anterior: Solicitacao | null
    documentos: Documento[]
    aoEnviar: () => Promise<void>
}) {
    const { pessoa } = useSessao()
    const responde = !!anterior
    const revogada = anterior?.situacao === 'REVOGADA'
    const precisaDocumentoNovo = anterior?.situacao === 'RECUSADA' && anterior.recusaPorDocumento

    const [email, setEmail] = useState(anterior?.emailInstitucional ?? pessoa?.email ?? '')
    const [resposta, setResposta] = useState('')
    const [documentoId, setDocumentoId] = useState<string>(
        precisaDocumentoNovo ? '' : anterior?.documentoId ? String(anterior.documentoId) : '',
    )
    const [arquivo, setArquivo] = useState<File | null>(null)
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    const usandoArquivo = documentoId === 'novo'
    const documentoEscolhido = usandoArquivo ? !!arquivo : documentoId !== ''
    const documentoRepetido = precisaDocumentoNovo && documentoId === String(anterior?.documentoId)
    const pronto =
        email.trim() !== '' &&
        (!responde || resposta.trim() !== '') &&
        (!precisaDocumentoNovo || (documentoEscolhido && !documentoRepetido)) &&
        (!usandoArquivo || !!arquivo)

    async function enviar() {
        setEnviando(true)
        setErro(null)
        try {
            let idDoDocumento: number | undefined = documentoId && !usandoArquivo ? Number(documentoId) : undefined
            if (usandoArquivo && arquivo) {
                // o envio do arquivo em si ainda não existe na API: registra os dados dele
                const novo = await cadastrarDocumento({
                    organizacaoId,
                    tipo: TIPO_DOCUMENTO,
                    nomeArquivo: arquivo.name,
                    tamanhoBytes: arquivo.size,
                    tipoMime: arquivo.type || undefined,
                    armazenamentoRef: `pendente-envio/${arquivo.name}`,
                })
                idDoDocumento = novo.id
            }
            await pedirPermissao({
                organizacaoId,
                emailInstitucional: email.trim(),
                documentoId: idDoDocumento,
                solicitacaoAnteriorId: anterior?.id,
                respostaRecusa: responde ? resposta.trim() : undefined,
            })
            await aoEnviar()
        } catch (e) {
            setErro(mensagemDeErro(e))
        } finally {
            setEnviando(false)
        }
    }

    return (
        <Bloco
            titulo={responde ? 'Pedir de novo' : 'Pedir a permissão de publicar'}
            apoio={
                responde
                    ? revogada
                        ? 'Responda ao motivo da revogação. Até a gestão aprovar o novo pedido, suas oportunidades ficam suspensas.'
                        : precisaDocumentoNovo
                          ? 'Responda ao motivo da recusa. Como a recusa foi pelo documento, o novo pedido precisa trazer outro documento.'
                          : 'Responda ao motivo da recusa.'
                    : 'A gestão do Porto Digital confere o e-mail e o documento antes de liberar.'
            }
        >
            <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                    e.preventDefault()
                    if (pronto) void enviar()
                }}
            >
                <Campo
                    rotulo="E-mail institucional"
                    type="email"
                    required
                    maxLength={254}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <CampoLista
                    rotulo={precisaDocumentoNovo ? 'Comprovação da organização (documento novo)' : 'Comprovação da organização (opcional)'}
                    value={documentoId}
                    onChange={(e) => setDocumentoId(e.target.value)}
                    ajuda={
                        documentoRepetido
                            ? 'Este é o documento do pedido recusado: ele não pode ser reenviado.'
                            : 'Escolha um documento que a organização já enviou ou registre um arquivo novo.'
                    }
                >
                    <option value="">{precisaDocumentoNovo ? 'Escolha o documento' : 'Sem documento'}</option>
                    {documentos.map((d) => (
                        <option key={d.id} value={d.id}>
                            {d.nomeArquivo} · enviado em {formatarData(d.enviadoEm)}
                            {d.id === anterior?.documentoId ? ' · do pedido anterior' : ''}
                        </option>
                    ))}
                    <option value="novo">Arquivo novo…</option>
                </CampoLista>

                {usandoArquivo && (
                    <Campo
                        rotulo="Arquivo da comprovação"
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
                        ajuda="O Up Hub registra o nome, o tamanho e o tipo do arquivo; a gestão confere o original."
                    />
                )}

                {responde && (
                    <CampoTexto
                        rotulo={revogada ? 'O que mudou desde a revogação (obrigatório)' : 'O que mudou desde a recusa (obrigatório)'}
                        required
                        value={resposta}
                        onChange={(e) => setResposta(e.target.value)}
                    />
                )}

                {erro && <Aviso tipo="erro">{erro}</Aviso>}

                <div className="flex items-center gap-3">
                    <Botao type="submit" variante="primario" disabled={!pronto || enviando}>
                        {enviando ? 'Enviando…' : responde ? 'Enviar novo pedido' : 'Enviar pedido'}
                    </Botao>
                </div>
                {responde && (
                    <p className="text-legenda text-secundario">
                        Sem a resposta ao motivo{precisaDocumentoNovo ? ' e sem um documento novo' : ''}, o botão fica
                        desabilitado e a API recusa o pedido. Último pedido decidido em{' '}
                        {formatarDataHora(anterior?.revogadaEm ?? anterior?.decididaEm)}.
                    </p>
                )}
            </form>
        </Bloco>
    )
}

export default ProvedorPedido
