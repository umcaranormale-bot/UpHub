import { useState, type ButtonHTMLAttributes, type FormEvent, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'

import { anexarDocumento, listarAnexos, removerAnexo } from '../api/anexos'
import { declarar, listarAutodeclaracoes, retirarAutodeclaracao } from '../api/autodeclaracoes'
import { buscarCandidatura, editarCandidatura, enviarCandidatura, type Envio } from '../api/candidaturas'
import { listarDocumentos } from '../api/documentos'
import { listarDocumentosExigidos } from '../api/documentosExigidos'
import { mensagemDeErro } from '../api/erros'
import { autorizarNota, listarNotasDaCandidatura, tirarNota } from '../api/notasDaCandidatura'
import { buscarOportunidade } from '../api/oportunidades'
import { adicionarParticipante, confirmarParticipacao, listarParticipantes, removerParticipante } from '../api/participantes'
import { listarMinhasProvas, registrarProva } from '../api/provas'
import { listarReservas } from '../api/reservas'
import { listarVinculos } from '../api/vinculos'
import CascaDoApp from '../components/CascaDoApp'
import { tamanhoDoArquivo, versaoPublicada } from '../components/candidato/apoio'
import { LinhaDeLista, OQueFaltou, Secao, SeloDaElegibilidade, TabelaDeRequisitos } from '../components/candidato/Blocos'
import NovoDocumento from '../components/candidato/NovoDocumento'
import { CustomButton } from '../components/CustomButton'
import SeloStatus from '../components/SeloStatus'
import { Campo, CampoLista, CampoTexto } from '../components/ui/Campo'
import { Aviso, Carregando, ErroNaTela } from '../components/ui/Estados'
import { ANEL_FOCO, CARTAO_COM_RESPIRO, TRANSICAO_COR } from '../estilos/classes'
import { formatarData, formatarDataHora, hoje, rotuloDoEstado, statusDoEstado } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_CANDIDATO } from '../navegacao/menus'
import { useSessao } from '../sessao/contexto'

/**
 * 06 e 64 · Candidato — montar e enviar a candidatura · rota /candidato/candidaturas/:id/editar
 *
 * O rascunho em partes: dados da proposta, participantes, notas de prova,
 * anexos dos documentos exigidos e autodeclaração para vaga reservada. O
 * envio passa pelo motor de elegibilidade, e a tela mostra o resultado.
 */

async function carregar(candidaturaId: number, organizacaoId: number) {
    const candidatura = await buscarCandidatura(candidaturaId)
    const [oportunidade, versao, participantes, notas, anexos, autodeclaracoes, documentos, vinculos, provas] =
        await Promise.all([
            buscarOportunidade(candidatura.oportunidadeId),
            versaoPublicada(candidatura.oportunidadeId),
            listarParticipantes(candidaturaId),
            listarNotasDaCandidatura(candidaturaId),
            listarAnexos(candidaturaId),
            listarAutodeclaracoes(candidaturaId),
            listarDocumentos(organizacaoId),
            listarVinculos({ organizacaoId }).catch(() => []),
            listarMinhasProvas().catch(() => []),
        ])
    const [exigidos, reservas] = versao
        ? await Promise.all([
              listarDocumentosExigidos(candidatura.oportunidadeId, versao.id),
              listarReservas(candidatura.oportunidadeId, versao.id),
          ])
        : [[], []]
    return {
        candidatura,
        oportunidade,
        versao,
        participantes,
        notas,
        anexos,
        autodeclaracoes,
        documentos,
        vinculos,
        provas,
        exigidos,
        reservas,
    }
}

type Dados = Awaited<ReturnType<typeof carregar>>

export default function CandidatoMontarCandidatura() {
    const { id } = useParams()
    const candidaturaId = Number(id)
    const { perfilAtivo } = useSessao()
    const organizacaoId = perfilAtivo?.vinculo.organizacaoId

    const { dados, carregando, erro, recarregar } = useDados(
        () => carregar(candidaturaId, organizacaoId as number),
        [candidaturaId, organizacaoId],
        !!organizacaoId && Number.isFinite(candidaturaId),
    )
    const [envio, setEnvio] = useState<Envio | null>(null)

    const casca = (conteudo: ReactNode) => (
        <CascaDoApp itens={MENU_CANDIDATO} voltarPara="/candidato/candidaturas">
            {conteudo}
        </CascaDoApp>
    )

    if (carregando && !dados) return casca(<Carregando />)
    if (erro || !dados) return casca(<ErroNaTela mensagem={erro ?? 'Candidatura não encontrada'} tentarDeNovo={recarregar} />)

    if (envio) return casca(<ResultadoDoEnvio envio={envio} titulo={dados.oportunidade.titulo} />)

    if (dados.candidatura.estado !== 'RASCUNHO') {
        return casca(
            <div className={`${CARTAO_COM_RESPIRO} flex flex-col items-start gap-3`}>
                <h1 className="font-display text-tela text-titulo">Candidatura · {dados.oportunidade.titulo}</h1>
                <div className="flex items-center gap-2">
                    <SeloStatus
                        status={statusDoEstado(dados.candidatura.estado)}
                        rotulo={rotuloDoEstado(dados.candidatura.estado)}
                        comPonto
                    />
                    <span className="text-apoio text-secundario">
                        Esta candidatura já foi enviada e não muda mais por aqui.
                    </span>
                </div>
                <CustomButton to={`/candidato/candidaturas/${candidaturaId}`} variant="aprovar" size="auto">
                    Acompanhar a candidatura
                </CustomButton>
            </div>,
        )
    }

    return casca(<Montagem key={dados.candidatura.id} dados={dados} recarregar={recarregar} aoEnviar={setEnvio} />)
}

function Montagem({
    dados,
    recarregar,
    aoEnviar,
}: {
    dados: Dados
    recarregar: () => Promise<void>
    aoEnviar: (envio: Envio) => void
}) {
    const { pessoa, perfilAtivo } = useSessao()
    const organizacaoId = perfilAtivo?.vinculo.organizacaoId as number
    const { candidatura, oportunidade, versao, participantes, notas, anexos, autodeclaracoes, documentos, exigidos, reservas } =
        dados

    const [titulo, setTitulo] = useState(candidatura.tituloProposta ?? '')
    const [resumo, setResumo] = useState(candidatura.resumoExecutivo ?? '')
    const [valor, setValor] = useState(candidatura.valorSolicitado?.toString() ?? '')
    const [ocupado, setOcupado] = useState(false)
    const [aviso, setAviso] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

    /** Roda uma ação, recarrega e mostra o aviso. */
    async function agir(acao: () => Promise<unknown>, sucesso: string) {
        setOcupado(true)
        setAviso(null)
        try {
            await acao()
            await recarregar()
            setAviso({ tipo: 'sucesso', texto: sucesso })
        } catch (e) {
            setAviso({ tipo: 'erro', texto: mensagemDeErro(e) })
        } finally {
            setOcupado(false)
        }
    }

    const valorNumero = valor.trim() === '' ? undefined : Number(valor.replace(',', '.'))
    const salvarDados = () =>
        editarCandidatura(candidatura.id, {
            tituloProposta: titulo.trim(),
            resumoExecutivo: resumo.trim(),
            valorSolicitado: valorNumero,
        })

    // o que ainda impede o envio (as mesmas regras que o back-end confere)
    const naoConfirmaram = participantes.filter((p) => !p.confirmouEm).map((p) => p.nome)
    const obrigatoriosSemAnexo = exigidos
        .filter((d) => d.obrigatorio && !anexos.some((a) => a.documentoExigidoId === d.id))
        .map((d) => d.nome)
    const vencidos = anexos.filter((a) => a.validade && a.validade < hoje()).map((a) => a.nomeArquivo)
    const pendencias = [
        !titulo.trim() && 'Preencha o título da proposta',
        naoConfirmaram.length > 0 && `Falta confirmar a participação: ${naoConfirmaram.join(', ')}`,
        versao?.notaMinima !== null &&
            versao?.notaMinima !== undefined &&
            notas.length === 0 &&
            `Esta oportunidade exige nota mínima ${versao.notaMinima}: autorize pelo menos uma nota de prova`,
        obrigatoriosSemAnexo.length > 0 && `Faltam documentos obrigatórios: ${obrigatoriosSemAnexo.join(', ')}`,
        vencidos.length > 0 && `Documentos vencidos: ${vencidos.join(', ')}`,
    ].filter((p): p is string => !!p)

    async function enviar() {
        setOcupado(true)
        setAviso(null)
        try {
            await salvarDados()
            const resultado = await enviarCandidatura(candidatura.id)
            aoEnviar(resultado)
            await recarregar()
        } catch (e) {
            setAviso({ tipo: 'erro', texto: mensagemDeErro(e) })
            await recarregar()
        } finally {
            setOcupado(false)
        }
    }

    const passos = [
        { rotulo: '1 · Dados', ok: !!titulo.trim() },
        { rotulo: '2 · Participantes', ok: naoConfirmaram.length === 0 },
        { rotulo: '3 · Notas', ok: versao?.notaMinima === null || versao?.notaMinima === undefined || notas.length > 0 },
        { rotulo: '4 · Anexos', ok: obrigatoriosSemAnexo.length === 0 && vencidos.length === 0 },
        ...(reservas.length > 0 ? [{ rotulo: '5 · Autodeclaração', ok: true }] : []),
    ]

    return (
        <>
            <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1">
                    <h1 className="font-display text-tela text-titulo">Candidatura · {oportunidade.titulo}</h1>
                    <p className="mt-1 text-apoio text-secundario">
                        Rascunho · {perfilAtivo?.vinculo.organizacaoNome}
                        {candidatura.salvaEm && ` · salvo em ${formatarDataHora(candidatura.salvaEm)}`}
                        {versao?.prazoEnvio && ` · envio até ${formatarData(versao.prazoEnvio)}`}
                    </p>
                </div>
                <CustomButton
                    type="button"
                    variant="neutro"
                    size="auto"
                    disabled={ocupado}
                    onClick={() => agir(salvarDados, 'Rascunho salvo.')}
                >
                    Salvar rascunho
                </CustomButton>
                <CustomButton type="button" variant="aprovar" size="auto" disabled={ocupado} onClick={enviar}>
                    Enviar candidatura
                </CustomButton>
            </div>

            <ul aria-label="Partes da candidatura" className="mt-4 flex flex-wrap gap-2">
                {passos.map((p) => (
                    <li key={p.rotulo}>
                        <SeloStatus status={p.ok ? 'aprovada' : 'pendente'} rotulo={`${p.rotulo} · ${p.ok ? 'pronto' : 'falta'}`} comPonto />
                    </li>
                ))}
            </ul>

            {oportunidade.suspensaEm && (
                <p className="mt-4 rounded-card border border-status-reprovada-borda bg-status-reprovada-fundo p-4 text-apoio text-status-reprovada-texto">
                    Oportunidade pausada desde {formatarData(oportunidade.suspensaEm)}: a permissão do provedor foi revogada. O
                    rascunho fica salvo, mas o envio só volta a funcionar quando a pausa terminar.
                </p>
            )}

            {pendencias.length > 0 ? (
                <div className="mt-4 rounded-card border border-aviso-borda bg-aviso-fundo p-4 text-apoio text-ocre">
                    <p>Antes de enviar, confira o que falta. No envio, o servidor confere cada parte e recusa se algo estiver pendente:</p>
                    <ul className="mt-2 list-disc pl-5">
                        {pendencias.map((p) => (
                            <li key={p}>{p}</li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p className="mt-4 rounded-card border border-status-aprovada-borda bg-status-aprovada-fundo p-4 text-apoio text-status-aprovada-texto">
                    Tudo pronto. No envio, o motor confere a elegibilidade da organização e a candidatura sai do rascunho.
                </p>
            )}

            {aviso && (
                <div className="mt-4">
                    <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>
                </div>
            )}

            <div className="mt-6 grid items-start gap-5 xl:grid-cols-2">
                <Secao titulo="Dados da proposta">
                    <div className="flex flex-col gap-4">
                        <Campo
                            rotulo="Título da proposta"
                            value={titulo}
                            maxLength={200}
                            required
                            onChange={(e) => setTitulo(e.target.value)}
                        />
                        <CampoTexto rotulo="Resumo executivo" value={resumo} onChange={(e) => setResumo(e.target.value)} />
                        <Campo
                            rotulo="Valor solicitado (R$)"
                            type="number"
                            min={0}
                            step="0.01"
                            value={valor}
                            onChange={(e) => setValor(e.target.value)}
                            ajuda="Opcional. Deixe vazio se a oportunidade não envolve valor."
                        />
                    </div>
                </Secao>

                <Participantes
                    dados={dados}
                    pessoaId={pessoa?.id}
                    ocupado={ocupado}
                    agir={agir}
                />

                <Notas dados={dados} pessoaId={pessoa?.id} ocupado={ocupado} agir={agir} />

                <Secao titulo="Anexos exigidos pela oportunidade" subtitulo="Documentos da organização, não vencidos." semRespiro>
                    {exigidos.length === 0 ? (
                        <p className="p-card text-apoio text-secundario">Esta oportunidade não exige documentos.</p>
                    ) : (
                        <ul>
                            {exigidos.map((d) => (
                                <DocumentoExigidoLinha
                                    key={d.id}
                                    nome={d.nome}
                                    obrigatorio={d.obrigatorio}
                                    anexo={anexos.find((a) => a.documentoExigidoId === d.id) ?? null}
                                    documentos={documentos.filter((doc) => !anexos.some((a) => a.documentoId === doc.id))}
                                    organizacaoId={organizacaoId}
                                    ocupado={ocupado}
                                    anexar={(documentoId) =>
                                        agir(
                                            () => anexarDocumento(candidatura.id, { documentoId, documentoExigidoId: d.id }),
                                            `Documento anexado a ${d.nome}.`,
                                        )
                                    }
                                    remover={(documentoId) =>
                                        agir(() => removerAnexo(candidatura.id, documentoId), 'Anexo removido.')
                                    }
                                />
                            ))}
                        </ul>
                    )}
                    {anexos.some((a) => a.documentoExigidoId === null) && (
                        <div className="border-t border-sutil">
                            <p className="px-card pt-4 text-item text-titulo">Outros anexos</p>
                            <ul>
                                {anexos
                                    .filter((a) => a.documentoExigidoId === null)
                                    .map((a) => (
                                        <LinhaDeLista
                                            key={a.documentoId}
                                            titulo={a.nomeArquivo}
                                            apoio={`${a.tipo} · ${tamanhoDoArquivo(a.tamanhoBytes)}`}
                                        >
                                            <BotaoTexto
                                                disabled={ocupado}
                                                onClick={() => agir(() => removerAnexo(candidatura.id, a.documentoId), 'Anexo removido.')}
                                            >
                                                Remover
                                            </BotaoTexto>
                                        </LinhaDeLista>
                                    ))}
                            </ul>
                        </div>
                    )}
                </Secao>

                {reservas.length > 0 && (
                    <Secao titulo="Autodeclaração · vaga reservada">
                        <p className="text-apoio text-secundario">
                            A oportunidade reserva vagas para os critérios abaixo. Marque só se for o caso: depois da homologação,
                            o provedor confere a declaração.
                        </p>
                        <ul className="mt-4 flex flex-col gap-3">
                            {reservas.map((r) => {
                                const declarada = autodeclaracoes.some(
                                    (a) => a.criterio.toLowerCase() === r.criterio.toLowerCase(),
                                )
                                return (
                                    <li key={r.id}>
                                        <label className="flex items-start gap-3 text-apoio text-titulo">
                                            <input
                                                type="checkbox"
                                                className="mt-1 size-4 accent-acento"
                                                checked={declarada}
                                                disabled={ocupado}
                                                onChange={() =>
                                                    agir(
                                                        () =>
                                                            declarada
                                                                ? retirarAutodeclaracao(candidatura.id, r.criterio)
                                                                : declarar(candidatura.id, r.criterio),
                                                        declarada ? 'Autodeclaração retirada.' : 'Autodeclaração registrada.',
                                                    )
                                                }
                                            />
                                            <span>
                                                Declaro que a organização se enquadra em <strong>{r.criterio}</strong> ({r.quantidade}{' '}
                                                {r.quantidade === 1 ? 'vaga reservada' : 'vagas reservadas'})
                                            </span>
                                        </label>
                                    </li>
                                )
                            })}
                        </ul>
                        <p className="mt-4 rounded-card bg-page p-4 text-apoio text-secundario">
                            Sem marcar nada, a candidatura concorre só na ampla concorrência. Se o provedor recusar a
                            autodeclaração, a candidatura é desclassificada.
                        </p>
                    </Secao>
                )}
            </div>
        </>
    )
}

type Agir = (acao: () => Promise<unknown>, sucesso: string) => Promise<void>

function BotaoTexto({ children, ...resto }: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            type="button"
            className={`rounded-card px-1 text-apoio text-acento hover:text-titulo disabled:opacity-50 ${TRANSICAO_COR} ${ANEL_FOCO}`}
            {...resto}
        >
            {children}
        </button>
    )
}

function Participantes({ dados, pessoaId, ocupado, agir }: { dados: Dados; pessoaId?: number; ocupado: boolean; agir: Agir }) {
    const { candidatura, participantes, vinculos } = dados
    const [escolhida, setEscolhida] = useState('')
    const eu = participantes.find((p) => p.pessoaId === pessoaId)
    // pessoas com vínculo ativo na organização que ainda não participam
    const pessoas = new Map<number, string>()
    for (const v of vinculos) {
        if (!v.encerradoEm && !participantes.some((p) => p.pessoaId === v.pessoaId)) pessoas.set(v.pessoaId, v.pessoaNome)
    }

    return (
        <Secao
            titulo="Participantes"
            subtitulo="Opcional. Cada participante confirma por si, logado; sem todas as confirmações, a candidatura não é enviada."
            semRespiro
        >
            {participantes.length === 0 ? (
                <p className="p-card text-apoio text-secundario">Nenhum participante adicionado.</p>
            ) : (
                <ul>
                    {participantes.map((p) => (
                        <LinhaDeLista
                            key={p.pessoaId}
                            titulo={p.nome}
                            apoio={
                                p.confirmouEm
                                    ? `confirmou em ${formatarData(p.confirmouEm)}`
                                    : `convite enviado em ${formatarData(p.conviteEnviadoEm)}`
                            }
                        >
                            <SeloStatus status={p.confirmouEm ? 'aprovada' : 'pendente'} rotulo={p.confirmouEm ? 'Confirmou' : 'Aguardando'} />
                            <BotaoTexto
                                disabled={ocupado}
                                aria-label={`Remover ${p.nome}`}
                                onClick={() => agir(() => removerParticipante(candidatura.id, p.pessoaId), `${p.nome} saiu da candidatura.`)}
                            >
                                Remover
                            </BotaoTexto>
                        </LinhaDeLista>
                    ))}
                </ul>
            )}
            <div className="flex flex-col gap-3 border-t border-sutil p-card">
                {eu && !eu.confirmouEm && (
                    <CustomButton
                        type="button"
                        variant="aprovar"
                        size="auto"
                        disabled={ocupado}
                        onClick={() => agir(() => confirmarParticipacao(candidatura.id), 'Participação confirmada.')}
                    >
                        Confirmar a minha participação
                    </CustomButton>
                )}
                {pessoas.size > 0 && (
                    <form
                        className="flex items-end gap-3"
                        onSubmit={(e: FormEvent) => {
                            e.preventDefault()
                            if (!escolhida) return
                            void agir(() => adicionarParticipante(candidatura.id, Number(escolhida)), 'Participante adicionado.').then(
                                () => setEscolhida(''),
                            )
                        }}
                    >
                        <div className="min-w-0 flex-1">
                            <CampoLista rotulo="Adicionar participante" value={escolhida} onChange={(e) => setEscolhida(e.target.value)}>
                                <option value="">Escolha uma pessoa da organização</option>
                                {[...pessoas].map(([id, nome]) => (
                                    <option key={id} value={id}>
                                        {nome}
                                    </option>
                                ))}
                            </CampoLista>
                        </div>
                        <CustomButton type="submit" variant="neutro" size="auto" disabled={ocupado || !escolhida}>
                            Adicionar
                        </CustomButton>
                    </form>
                )}
            </div>
        </Secao>
    )
}

function Notas({ dados, pessoaId, ocupado, agir }: { dados: Dados; pessoaId?: number; ocupado: boolean; agir: Agir }) {
    const { candidatura, versao, notas, provas } = dados
    const [novaNota, setNovaNota] = useState('')
    const [dataProva, setDataProva] = useState('')
    const [area, setArea] = useState('')
    const [abrirForm, setAbrirForm] = useState(false)
    const autorizadas = new Set(notas.map((n) => n.resultadoProvaId))
    const minhasLivres = provas.filter((p) => !autorizadas.has(p.id))

    return (
        <Secao
            titulo="Notas de prova"
            subtitulo={
                versao?.notaMinima !== null && versao?.notaMinima !== undefined
                    ? `Esta oportunidade exige nota mínima ${versao.notaMinima} (média das notas autorizadas). A nota vale ${versao.validadeNotaDias} dias a partir da prova.`
                    : 'Esta oportunidade não exige nota mínima. A nota é da pessoa: cada uma autoriza o uso da própria.'
            }
            semRespiro
        >
            {notas.length === 0 ? (
                <p className="p-card text-apoio text-secundario">Nenhuma nota autorizada nesta candidatura.</p>
            ) : (
                <ul>
                    {notas.map((n) => (
                        <LinhaDeLista
                            key={n.id}
                            titulo={`${n.pessoaNome} · ${n.notaCongelada}${n.area ? ` em ${n.area}` : ''}`}
                            apoio={`prova em ${formatarData(n.dataProvaCongelada)} · vale até ${formatarData(n.validaAte)}`}
                        >
                            <SeloStatus status="aprovada" rotulo="Autorizou" />
                            {n.pessoaId === pessoaId && (
                                <BotaoTexto
                                    disabled={ocupado}
                                    onClick={() => agir(() => tirarNota(candidatura.id, n.id), 'Autorização retirada.')}
                                >
                                    Tirar
                                </BotaoTexto>
                            )}
                        </LinhaDeLista>
                    ))}
                </ul>
            )}

            <div className="flex flex-col gap-3 border-t border-sutil p-card">
                <p className="text-item text-titulo">Minhas notas</p>
                {minhasLivres.length === 0 ? (
                    <p className="text-apoio text-secundario">Nenhuma nota sua para autorizar.</p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {minhasLivres.map((p) => (
                            <li key={p.id} className="flex items-center gap-3 text-apoio">
                                <span className="min-w-0 flex-1 text-titulo">
                                    {p.nota}
                                    {p.area ? ` em ${p.area}` : ''} · prova em {formatarData(p.dataProva)}
                                </span>
                                <CustomButton
                                    type="button"
                                    variant="neutro"
                                    size="auto"
                                    disabled={ocupado}
                                    onClick={() => agir(() => autorizarNota(candidatura.id, p.id), 'Nota autorizada nesta candidatura.')}
                                >
                                    Autorizar uso
                                </CustomButton>
                            </li>
                        ))}
                    </ul>
                )}
                {abrirForm ? (
                    <form
                        className="flex flex-col gap-3 rounded-card border border-sutil bg-page p-4"
                        onSubmit={(e) => {
                            e.preventDefault()
                            void agir(
                                () =>
                                    registrarProva({
                                        nota: Number(novaNota.replace(',', '.')),
                                        dataProva,
                                        area: area.trim() || undefined,
                                    }),
                                'Nota registrada. Agora autorize o uso dela.',
                            ).then(() => {
                                setNovaNota('')
                                setDataProva('')
                                setArea('')
                                setAbrirForm(false)
                            })
                        }}
                    >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <Campo rotulo="Nota (0 a 100)" type="number" min={0} max={100} step="0.01" required value={novaNota} onChange={(e) => setNovaNota(e.target.value)} />
                            <Campo rotulo="Data da prova" type="date" max={hoje()} required value={dataProva} onChange={(e) => setDataProva(e.target.value)} />
                            <Campo rotulo="Área (opcional)" maxLength={80} value={area} onChange={(e) => setArea(e.target.value)} />
                        </div>
                        <div className="flex gap-3">
                            <CustomButton type="submit" variant="aprovar" size="auto" disabled={ocupado}>
                                Registrar nota
                            </CustomButton>
                            <CustomButton type="button" variant="neutro" size="auto" onClick={() => setAbrirForm(false)}>
                                Cancelar
                            </CustomButton>
                        </div>
                    </form>
                ) : (
                    <div>
                        <BotaoTexto onClick={() => setAbrirForm(true)}>Registrar uma nota de prova</BotaoTexto>
                    </div>
                )}
            </div>
        </Secao>
    )
}

function DocumentoExigidoLinha({
    nome,
    obrigatorio,
    anexo,
    documentos,
    organizacaoId,
    ocupado,
    anexar,
    remover,
}: {
    nome: string
    obrigatorio: boolean
    anexo: Dados['anexos'][number] | null
    documentos: Dados['documentos']
    organizacaoId: number
    ocupado: boolean
    anexar: (documentoId: number) => Promise<void>
    remover: (documentoId: number) => Promise<void>
}) {
    const [escolhido, setEscolhido] = useState('')
    const [novo, setNovo] = useState(false)
    const validos = documentos.filter((d) => !d.validade || d.validade >= hoje())
    const vencido = !!anexo?.validade && anexo.validade < hoje()

    return (
        <li className="flex flex-col gap-3 border-b border-sutil px-card py-4 last:border-b-0">
            <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-item text-titulo">{nome}</p>
                    <p className="mt-1 text-apoio text-secundario">
                        {anexo
                            ? `${anexo.nomeArquivo} · ${tamanhoDoArquivo(anexo.tamanhoBytes)}${
                                  anexo.validade ? ` · válido até ${formatarData(anexo.validade)}` : ''
                              }`
                            : obrigatorio
                              ? 'obrigatório'
                              : 'opcional'}
                    </p>
                </div>
                {anexo && vencido ? (
                    <>
                        <SeloStatus status="reprovada" rotulo="Vencido" comPonto />
                        <BotaoTexto
                            disabled={ocupado}
                            aria-label={`Trocar o anexo de ${nome}`}
                            onClick={() => void remover(anexo.documentoId).then(() => setNovo(true))}
                        >
                            Trocar
                        </BotaoTexto>
                    </>
                ) : anexo ? (
                    <>
                        <SeloStatus status="aprovada" rotulo="Anexado" />
                        <BotaoTexto disabled={ocupado} aria-label={`Remover o anexo de ${nome}`} onClick={() => remover(anexo.documentoId)}>
                            Remover
                        </BotaoTexto>
                    </>
                ) : (
                    <SeloStatus status={obrigatorio ? 'pendente' : 'rascunho'} rotulo="Falta enviar" />
                )}
            </div>
            {!anexo && (
                <>
                    {validos.length > 0 && (
                        <div className="flex items-end gap-3">
                            <div className="min-w-0 flex-1">
                                <CampoLista rotulo={`Documento para ${nome}`} value={escolhido} onChange={(e) => setEscolhido(e.target.value)}>
                                    <option value="">Escolha um documento da organização</option>
                                    {validos.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.nomeArquivo} · {d.tipo}
                                        </option>
                                    ))}
                                </CampoLista>
                            </div>
                            <CustomButton
                                type="button"
                                variant="neutro"
                                size="auto"
                                disabled={ocupado || !escolhido}
                                onClick={() => void anexar(Number(escolhido)).then(() => setEscolhido(''))}
                            >
                                Anexar
                            </CustomButton>
                        </div>
                    )}
                    {novo ? (
                        <NovoDocumento
                            organizacaoId={organizacaoId}
                            tipoSugerido={nome.toUpperCase().slice(0, 60)}
                            aoCriar={async (doc) => {
                                setNovo(false)
                                await anexar(doc.id)
                            }}
                            aoCancelar={() => setNovo(false)}
                        />
                    ) : (
                        <div>
                            <BotaoTexto onClick={() => setNovo(true)}>Enviar arquivo novo</BotaoTexto>
                        </div>
                    )}
                </>
            )}
        </li>
    )
}

function ResultadoDoEnvio({ envio, titulo }: { envio: Envio; titulo: string }) {
    const { candidatura, elegibilidade } = envio
    const texto =
        elegibilidade.situacao === 'ELEGIVEL'
            ? 'A organização atende todos os requisitos obrigatórios. A candidatura segue para a avaliação.'
            : elegibilidade.situacao === 'INELEGIVEL'
              ? 'Um requisito obrigatório não foi atendido. A candidatura não segue para a avaliação.'
              : 'Falta um dado da organização para conferir algum requisito. O provedor confere e decide.'
    return (
        <>
            <h1 className="font-display text-tela text-titulo">Candidatura enviada · {titulo}</h1>
            <div className="mt-2 flex items-center gap-2">
                <SeloStatus status={statusDoEstado(candidatura.estado)} rotulo={rotuloDoEstado(candidatura.estado)} comPonto />
                {candidatura.enviadaEm && (
                    <span className="text-apoio text-secundario">enviada em {formatarDataHora(candidatura.enviadaEm)}</span>
                )}
            </div>
            <div className="mt-6 flex flex-col gap-5">
                <Aviso tipo={elegibilidade.situacao === 'INELEGIVEL' ? 'erro' : 'sucesso'}>{texto}</Aviso>
                <Secao
                    titulo="Elegibilidade no envio"
                    acao={<SeloDaElegibilidade situacao={elegibilidade.situacao} />}
                >
                    <div className="flex flex-col gap-4">
                        <OQueFaltou itens={elegibilidade.faltou} />
                        <TabelaDeRequisitos
                            linhas={elegibilidade.requisitos.map((r) => ({
                                id: r.requisitoId,
                                campo: r.campo,
                                operador: r.operador,
                                valorExigido: r.valorExigido,
                                valorInformado: r.valorInformado,
                                obrigatoria: r.obrigatoria,
                                situacao: r.situacao,
                                explicacao: r.explicacao,
                            }))}
                        />
                    </div>
                </Secao>
                <div className="flex gap-3">
                    <CustomButton to={`/candidato/candidaturas/${candidatura.id}`} variant="aprovar" size="auto">
                        Acompanhar a candidatura
                    </CustomButton>
                    <CustomButton to="/candidato/candidaturas" variant="neutro" size="auto">
                        Minhas candidaturas
                    </CustomButton>
                </div>
            </div>
        </>
    )
}
