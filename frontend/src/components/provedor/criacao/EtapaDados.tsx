import { useState } from 'react'

import { mensagemDeErro } from '../../../api/erros'
import { criarOportunidade, editarOportunidade, type Oportunidade } from '../../../api/oportunidades'
import { listarTrilhasDasOrganizacoes } from '../../../api/organizacaoTrilhas'
import { listarResidencias } from '../../../api/residencias'
import type { TrilhaCodigo } from '../../../api/trilhas'
import { criarVersao } from '../../../api/versoes'
import { ANEL_FOCO, TRANSICAO_COR } from '../../../estilos/classes'
import { formatarData, ROTULO_TRILHA } from '../../../estilos/formatos'
import useDados from '../../../hooks/useDados'
import { Campo, CampoLista, CampoTexto } from '../../ui/Campo'
import { Aviso, Carregando, ErroNaTela } from '../../ui/Estados'
import Botao from '../Botao'
import { Bloco } from '../Cabecalho'

const EXPLICACAO_TRILHA: Record<TrilhaCodigo, string> = {
    FOMENTO: 'Edital. Aceita empresa e startup.',
    INVESTIMENTO: 'Programa ou rodada. Aceita só startup, com deck.',
    FORMACAO: 'Desafio numa residência. Aceita só squad.',
}

/**
 * Etapa 1 · trilha, título, resumo, área e, conforme a trilha, a tese
 * (Investimento) ou a residência (Formação). Sem oportunidade, cria o rascunho
 * e a primeira versão; com ela, edita (só enquanto é rascunho).
 */
export function EtapaDados({
    organizacaoId,
    oportunidade,
    aoSalvar,
}: {
    organizacaoId: number
    oportunidade: Oportunidade | null
    aoSalvar: (oportunidade: Oportunidade, criada: boolean) => void
}) {
    const opcoes = useDados(
        async () => {
            const [trilhas, residencias] = await Promise.all([
                listarTrilhasDasOrganizacoes(organizacaoId),
                listarResidencias().catch(() => []),
            ])
            return { trilhas, residencias: residencias.filter((r) => r.estado === 'ABERTA') }
        },
        [organizacaoId],
    )

    const [trilha, setTrilha] = useState<TrilhaCodigo | null>(oportunidade?.trilhaCodigo ?? null)
    const [titulo, setTitulo] = useState(oportunidade?.titulo ?? '')
    const [resumo, setResumo] = useState(oportunidade?.resumo ?? '')
    const [area, setArea] = useState(oportunidade?.area ?? '')
    const [tese, setTese] = useState(oportunidade?.tese ?? '')
    const [residenciaId, setResidenciaId] = useState(oportunidade?.residenciaId ? String(oportunidade.residenciaId) : '')
    const [salvando, setSalvando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    const editando = !!oportunidade
    const liberadas = opcoes.dados?.trilhas.map((t) => t.trilhaCodigo) ?? []
    const pronto = !!trilha && titulo.trim() !== ''

    async function salvar() {
        if (!trilha) return
        setSalvando(true)
        setErro(null)
        try {
            if (oportunidade) {
                const salva = await editarOportunidade(oportunidade.id, {
                    titulo: titulo.trim(),
                    resumo,
                    area,
                    tese: oportunidade.trilhaCodigo === 'INVESTIMENTO' ? tese : undefined,
                    residenciaId:
                        oportunidade.trilhaCodigo === 'FORMACAO' && residenciaId ? Number(residenciaId) : undefined,
                })
                aoSalvar(salva, false)
            } else {
                const criada = await criarOportunidade({
                    organizacaoId,
                    trilhaCodigo: trilha,
                    titulo: titulo.trim(),
                    resumo: resumo.trim() || undefined,
                    area: area.trim() || undefined,
                    tese: trilha === 'INVESTIMENTO' && tese.trim() ? tese.trim() : undefined,
                    residenciaId: trilha === 'FORMACAO' && residenciaId ? Number(residenciaId) : undefined,
                })
                // toda oportunidade nasce com uma versão em rascunho, onde ficam as regras
                await criarVersao(criada.id)
                aoSalvar(criada, true)
            }
        } catch (e) {
            setErro(mensagemDeErro(e))
        } finally {
            setSalvando(false)
        }
    }

    if (opcoes.carregando && !opcoes.dados) return <Carregando />
    if (opcoes.erro) return <ErroNaTela mensagem={opcoes.erro} tentarDeNovo={() => void opcoes.recarregar()} />

    return (
        <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
                e.preventDefault()
                if (pronto) void salvar()
            }}
        >
            <Bloco
                titulo="Trilha"
                apoio={editando ? 'A trilha não muda depois que o rascunho é criado.' : 'Só aparecem as trilhas liberadas para a organização.'}
            >
                {liberadas.length === 0 ? (
                    <Aviso tipo="erro">
                        A organização ainda não atua em nenhuma trilha. Peça à gestão do Porto Digital para liberar uma trilha.
                    </Aviso>
                ) : (
                    <div role="radiogroup" aria-label="Trilha" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {(['FOMENTO', 'INVESTIMENTO', 'FORMACAO'] as TrilhaCodigo[])
                            .filter((t) => liberadas.includes(t) || t === oportunidade?.trilhaCodigo)
                            .map((t) => {
                                const ativa = trilha === t
                                return (
                                    <button
                                        key={t}
                                        type="button"
                                        role="radio"
                                        aria-checked={ativa}
                                        disabled={editando && !ativa}
                                        onClick={() => setTrilha(t)}
                                        className={`rounded-card border p-4 text-left ${TRANSICAO_COR} disabled:opacity-50 ${
                                            ativa ? 'border-acento bg-acento-suave' : 'border-sutil bg-card hover:bg-page'
                                        } ${ANEL_FOCO}`}
                                    >
                                        <span className={`block text-item ${ativa ? 'text-acento' : 'text-titulo'}`}>
                                            {ROTULO_TRILHA[t]}
                                        </span>
                                        <span className="mt-1 block text-apoio text-secundario">{EXPLICACAO_TRILHA[t]}</span>
                                    </button>
                                )
                            })}
                    </div>
                )}
            </Bloco>

            <div className="flex flex-wrap items-start gap-5">
                <div className="min-w-0 flex-1">
                    <Bloco titulo="Dados">
                        <div className="flex flex-col gap-4">
                            <Campo rotulo="Título" required maxLength={200} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
                            <CampoTexto rotulo="Resumo" value={resumo} onChange={(e) => setResumo(e.target.value)} />
                            <Campo
                                rotulo="Área"
                                maxLength={80}
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                ajuda="Palavras separadas por vírgula, como “Logística, mobilidade urbana, dados”. O matching compara a área com o setor e a descrição de quem se candidata."
                            />
                        </div>
                    </Bloco>
                </div>

                {trilha === 'INVESTIMENTO' && (
                    <div className="min-w-0 flex-1">
                        <Bloco titulo="Tese de investimento">
                            <CampoTexto
                                rotulo="Tese"
                                rows={6}
                                value={tese}
                                onChange={(e) => setTese(e.target.value)}
                                ajuda="Só existe na trilha Investimento. Pesa 40 no matching: as palavras da tese são comparadas com a descrição, o setor e o estágio da startup."
                            />
                        </Bloco>
                    </div>
                )}
            </div>

            {trilha === 'FORMACAO' && (
                <Bloco titulo="Na trilha Formação">
                    <CampoLista
                        rotulo="Residência"
                        value={residenciaId}
                        onChange={(e) => setResidenciaId(e.target.value)}
                        ajuda="A squad só se candidata se estiver na mesma residência."
                    >
                        <option value="">Sem residência</option>
                        {(opcoes.dados?.residencias ?? []).map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.nome}
                                {r.codigo ? ` · ${r.codigo}` : ''} · até {formatarData(r.fim)}
                            </option>
                        ))}
                    </CampoLista>
                </Bloco>
            )}

            {erro && <Aviso tipo="erro">{erro}</Aviso>}

            <div className="flex justify-end">
                <Botao type="submit" variante="primario" disabled={!pronto || salvando}>
                    {salvando ? 'Salvando…' : editando ? 'Salvar e seguir' : 'Criar rascunho e seguir'}
                </Botao>
            </div>
        </form>
    )
}

export default EtapaDados
