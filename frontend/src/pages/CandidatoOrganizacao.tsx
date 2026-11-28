import { useState } from 'react'

import { listarDocumentos, type Documento } from '../api/documentos'
import { mensagemDeErro } from '../api/erros'
import { listarTrilhasDasOrganizacoes } from '../api/organizacaoTrilhas'
import { buscarOrganizacao, editarOrganizacao, type Organizacao, type OrganizacaoEdicao } from '../api/organizacoes'
import CascaDoApp from '../components/CascaDoApp'
import { tamanhoDoArquivo } from '../components/candidato/apoio'
import { LinhaDeLista, Secao } from '../components/candidato/Blocos'
import NovoDocumento from '../components/candidato/NovoDocumento'
import { CustomButton } from '../components/CustomButton'
import SeloDeTrilha from '../components/SeloDeTrilha'
import SeloStatus from '../components/SeloStatus'
import { Campo, CampoLista, CampoTexto } from '../components/ui/Campo'
import { Aviso, Carregando, ErroNaTela } from '../components/ui/Estados'
import { ANEL_FOCO, TRANSICAO_COR } from '../estilos/classes'
import { formatarData, hoje, ROTULO_TIPO_ORGANIZACAO, trilhaDoSelo } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_CANDIDATO } from '../navegacao/menus'
import { useSessao } from '../sessao/contexto'

/**
 * 22 e 66 · Candidato — perfil da organização · rota /candidato/organizacao
 *
 * Os dados da organização (o perfil alimenta a elegibilidade e o matching),
 * as trilhas e os documentos. Só o representante edita. Descrição e deck
 * são do perfil da startup (66).
 */

const CAMPOS: { chave: keyof OrganizacaoEdicao & keyof Organizacao; rotulo: string; max?: number; ajuda?: string }[] = [
    { chave: 'nome', rotulo: 'Nome', max: 200 },
    { chave: 'razaoSocial', rotulo: 'Razão social', max: 200 },
    { chave: 'cnpj', rotulo: 'CNPJ', ajuda: '14 números; pontos, barra e traço são removidos.' },
    { chave: 'porte', rotulo: 'Porte', max: 30, ajuda: 'Ex.: ME, EPP. Usado nos requisitos de elegibilidade.' },
    { chave: 'setor', rotulo: 'Setor', max: 80, ajuda: 'Usado na elegibilidade e no matching (área).' },
    { chave: 'estagio', rotulo: 'Estágio', max: 40, ajuda: 'Ex.: ideação, tração, escala.' },
    { chave: 'anoFundacao', rotulo: 'Ano de fundação', ajuda: 'Dá o tempo de mercado.' },
    { chave: 'sedeCidade', rotulo: 'Cidade da sede', max: 80 },
    { chave: 'sedeUf', rotulo: 'UF da sede', max: 2 },
]

export default function CandidatoOrganizacao() {
    const { perfilAtivo, recarregar: recarregarSessao } = useSessao()
    const organizacaoId = perfilAtivo?.vinculo.organizacaoId
    const representante = !!perfilAtivo?.vinculo.representante

    const { dados, carregando, erro, recarregar } = useDados(
        async () => {
            const [organizacao, trilhas, documentos] = await Promise.all([
                buscarOrganizacao(organizacaoId as number),
                listarTrilhasDasOrganizacoes(organizacaoId as number).catch(() => null),
                listarDocumentos(organizacaoId as number),
            ])
            return { organizacao, trilhas, documentos }
        },
        [organizacaoId],
        !!organizacaoId,
    )

    if (carregando && !dados) {
        return (
            <CascaDoApp itens={MENU_CANDIDATO}>
                <Carregando />
            </CascaDoApp>
        )
    }
    if (erro || !dados) {
        return (
            <CascaDoApp itens={MENU_CANDIDATO}>
                <ErroNaTela mensagem={erro ?? 'Organização não encontrada'} tentarDeNovo={recarregar} />
            </CascaDoApp>
        )
    }

    return (
        <CascaDoApp itens={MENU_CANDIDATO}>
            <Perfil
                key={dados.organizacao.id}
                organizacao={dados.organizacao}
                trilhas={dados.trilhas}
                documentos={dados.documentos}
                representante={representante}
                recarregar={async () => {
                    await recarregar()
                    await recarregarSessao()
                }}
                recarregarDocumentos={recarregar}
            />
        </CascaDoApp>
    )
}

function Perfil({
    organizacao,
    trilhas,
    documentos,
    representante,
    recarregar,
    recarregarDocumentos,
}: {
    organizacao: Organizacao
    trilhas: Awaited<ReturnType<typeof listarTrilhasDasOrganizacoes>> | null
    documentos: Documento[]
    representante: boolean
    recarregar: () => Promise<void>
    recarregarDocumentos: () => Promise<void>
}) {
    const startup = organizacao.tipo === 'STARTUP'
    const inicial = () =>
        Object.fromEntries(CAMPOS.map((c) => [c.chave, organizacao[c.chave]?.toString() ?? ''])) as Record<string, string>
    const [valores, setValores] = useState<Record<string, string>>(inicial)
    const [descricao, setDescricao] = useState(organizacao.descricao ?? '')
    const [deck, setDeck] = useState(organizacao.deckDocumentoId?.toString() ?? '')
    const [salvando, setSalvando] = useState(false)
    const [aviso, setAviso] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)
    const [novoDocumento, setNovoDocumento] = useState(false)

    const deckAtual = documentos.find((d) => d.id === organizacao.deckDocumentoId)

    async function salvar() {
        setSalvando(true)
        setAviso(null)
        // campo vazio = não muda (regra do back-end), então só vai o que tem texto
        const dados: OrganizacaoEdicao = {}
        for (const c of CAMPOS) {
            const v = valores[c.chave].trim()
            if (!v) continue
            if (c.chave === 'anoFundacao') dados.anoFundacao = Number(v)
            else (dados as Record<string, string>)[c.chave] = v
        }
        if (startup) {
            if (descricao.trim()) dados.descricao = descricao.trim()
            if (deck) dados.deckDocumentoId = Number(deck)
        }
        try {
            await editarOrganizacao(organizacao.id, dados)
            await recarregar()
            setAviso({ tipo: 'sucesso', texto: 'Perfil da organização salvo.' })
        } catch (e) {
            setAviso({ tipo: 'erro', texto: mensagemDeErro(e) })
        } finally {
            setSalvando(false)
        }
    }

    return (
        <>
            <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1">
                    <h1 className="font-display text-tela text-titulo">Perfil da organização</h1>
                    <p className="mt-1 text-apoio text-secundario">
                        {organizacao.nome} · {ROTULO_TIPO_ORGANIZACAO[organizacao.tipo] ?? organizacao.tipo} · o perfil alimenta a
                        elegibilidade e o matching
                    </p>
                </div>
                {representante && (
                    <CustomButton type="button" variant="aprovar" size="auto" disabled={salvando} onClick={salvar}>
                        {salvando ? 'Salvando…' : 'Salvar alterações'}
                    </CustomButton>
                )}
            </div>

            {!representante && (
                <p className="mt-4 rounded-card border border-aviso-borda bg-aviso-fundo p-4 text-apoio text-ocre">
                    Só o representante da organização edita o perfil. Fale com ele para mudar algum dado.
                </p>
            )}
            {aviso && (
                <div className="mt-4">
                    <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>
                </div>
            )}

            <div className="mt-6 grid items-start gap-5 xl:grid-cols-2">
                <Secao titulo="Dados da organização">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-secundario">Tipo</span>
                            <SeloStatus status="enviada" rotulo={ROTULO_TIPO_ORGANIZACAO[organizacao.tipo] ?? organizacao.tipo} />
                            <span className="text-legenda text-secundario">o tipo não muda depois do cadastro</span>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            {CAMPOS.map((c) => (
                                <Campo
                                    key={c.chave}
                                    rotulo={c.rotulo}
                                    value={valores[c.chave]}
                                    maxLength={c.max}
                                    type={c.chave === 'anoFundacao' ? 'number' : 'text'}
                                    min={c.chave === 'anoFundacao' ? 1800 : undefined}
                                    max={c.chave === 'anoFundacao' ? Number(hoje().slice(0, 4)) : undefined}
                                    ajuda={c.ajuda}
                                    disabled={!representante}
                                    onChange={(e) => setValores((v) => ({ ...v, [c.chave]: e.target.value }))}
                                />
                            ))}
                        </div>
                        {representante && (
                            <p className="text-legenda text-secundario">Campo vazio não muda o que já está salvo.</p>
                        )}
                    </div>
                </Secao>

                <div className="flex flex-col gap-5">
                    {startup && (
                        <Secao titulo="Descrição e deck" subtitulo="Só startup tem deck. Os investidores veem o deck junto com a candidatura.">
                            <div className="flex flex-col gap-4">
                                <CampoTexto
                                    rotulo="Descrição"
                                    value={descricao}
                                    disabled={!representante}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    ajuda="Usada no matching: as palavras daqui são comparadas com a área e a tese das oportunidades."
                                />
                                {deckAtual && (
                                    <p className="rounded-card bg-page p-4 text-apoio text-titulo">
                                        Deck atual: {deckAtual.nomeArquivo} · {tamanhoDoArquivo(deckAtual.tamanhoBytes)} · enviado em{' '}
                                        {formatarData(deckAtual.enviadoEm)}
                                    </p>
                                )}
                                {representante && (
                                    <CampoLista rotulo="Deck" value={deck} onChange={(e) => setDeck(e.target.value)} ajuda="Um documento da própria startup. Cadastre o arquivo em Documentos.">
                                        <option value="">{deckAtual ? 'Manter o deck atual' : 'Sem deck'}</option>
                                        {documentos.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.nomeArquivo} · {d.tipo}
                                            </option>
                                        ))}
                                    </CampoLista>
                                )}
                            </div>
                        </Secao>
                    )}

                    <Secao titulo="Trilhas da organização" subtitulo="As trilhas em que a organização atua.">
                        {trilhas === null ? (
                            <p className="text-apoio text-secundario">Não foi possível ler as trilhas.</p>
                        ) : trilhas.length === 0 ? (
                            <p className="text-apoio text-secundario">Nenhuma trilha associada.</p>
                        ) : (
                            <ul className="flex flex-wrap gap-2">
                                {trilhas.map((t) => (
                                    <li key={t.trilhaCodigo}>
                                        <SeloDeTrilha trilha={trilhaDoSelo(t.trilhaCodigo)} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Secao>

                    <Secao
                        titulo="Documentos"
                        subtitulo="Os arquivos da organização, usados nos anexos das candidaturas."
                        acao={
                            !novoDocumento ? (
                                <button
                                    type="button"
                                    onClick={() => setNovoDocumento(true)}
                                    className={`rounded-card px-1 text-apoio text-acento hover:text-titulo ${TRANSICAO_COR} ${ANEL_FOCO}`}
                                >
                                    Cadastrar documento
                                </button>
                            ) : undefined
                        }
                        semRespiro
                    >
                        {novoDocumento && (
                            <div className="p-card">
                                <NovoDocumento
                                    organizacaoId={organizacao.id}
                                    aoCriar={async () => {
                                        setNovoDocumento(false)
                                        await recarregarDocumentos()
                                        setAviso({ tipo: 'sucesso', texto: 'Documento cadastrado.' })
                                    }}
                                    aoCancelar={() => setNovoDocumento(false)}
                                />
                            </div>
                        )}
                        {documentos.length === 0 ? (
                            <p className="p-card text-apoio text-secundario">Nenhum documento cadastrado.</p>
                        ) : (
                            <ul>
                                {documentos.map((d) => {
                                    const vencido = !!d.validade && d.validade < hoje()
                                    return (
                                        <LinhaDeLista
                                            key={d.id}
                                            titulo={d.nomeArquivo}
                                            apoio={`${d.tipo} · ${tamanhoDoArquivo(d.tamanhoBytes)} · enviado em ${formatarData(d.enviadoEm)} por ${d.enviadoPorNome}`}
                                        >
                                            {d.validade && (
                                                <SeloStatus
                                                    status={vencido ? 'reprovada' : 'aprovada'}
                                                    rotulo={vencido ? `Venceu em ${formatarData(d.validade)}` : `Vale até ${formatarData(d.validade)}`}
                                                />
                                            )}
                                            {d.id === organizacao.deckDocumentoId && <SeloStatus status="enviada" rotulo="Deck" />}
                                        </LinhaDeLista>
                                    )
                                })}
                            </ul>
                        )}
                    </Secao>
                </div>
            </div>
        </>
    )
}
