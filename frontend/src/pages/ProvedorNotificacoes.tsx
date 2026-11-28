import { useState } from 'react'
import { Link } from 'react-router-dom'

import { listarAjustes } from '../api/ajustes'
import { mensagemDeErro } from '../api/erros'
import { listarNotificacoes, marcarComoLida, marcarTodasComoLidas, type Notificacao, type TipoNotificacao } from '../api/notificacoes'
import AbasDeFiltro, { type Aba } from '../components/AbasDeFiltro'
import CascaDoApp from '../components/CascaDoApp'
import Botao, { BotaoLink } from '../components/provedor/Botao'
import Cabecalho, { Bloco } from '../components/provedor/Cabecalho'
import { carregarPainel, nomesDasOrganizacoes } from '../components/provedor/dados'
import { Aviso, Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { ANEL_FOCO } from '../estilos/classes'
import { diasAte, formatarData, formatarDataHora } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_PROVEDOR } from '../navegacao/menus'
import { useSessao } from '../sessao/contexto'

/**
 * 29 · Provedor — notificações e prazos · rota /provedor/notificacoes
 *
 * Os avisos da pessoa (os que pedem ação e os informativos) e os prazos que
 * vencem: o prazo de envio das oportunidades abertas e o de reenvio dos ajustes.
 */

type Filtro = 'TODAS' | TipoNotificacao

interface Prazo {
    chave: string
    data: string
    titulo: string
    detalhe: string
    para: string
}

function ProvedorNotificacoes() {
    const { perfilAtivo } = useSessao()
    const organizacaoId = perfilAtivo?.vinculo.organizacaoId
    const [filtro, setFiltro] = useState<Filtro>('TODAS')
    const [erroAcao, setErroAcao] = useState<string | null>(null)

    const notificacoes = useDados(() => listarNotificacoes(), [])

    const prazos = useDados(
        async () => {
            const painel = await carregarPainel(organizacaoId!)
            const lista: Prazo[] = []
            for (const { oportunidade: o, versao, candidaturas } of painel) {
                if ((o.estado === 'PUBLICADA' || o.estado === 'EM_AVALIACAO') && versao?.prazoEnvio && diasAte(versao.prazoEnvio) >= 0) {
                    lista.push({
                        chave: `envio-${o.id}`,
                        data: versao.prazoEnvio,
                        titulo: `${o.titulo} encerra o envio`,
                        detalhe: `${candidaturas.length} candidatura${candidaturas.length === 1 ? '' : 's'} recebida${candidaturas.length === 1 ? '' : 's'} até agora`,
                        para: `/provedor/candidaturas?oportunidade=${o.id}`,
                    })
                }
            }
            const emAjuste = painel.flatMap((p) => p.candidaturas.filter((c) => c.estado === 'AJUSTE').map((c) => ({ c, o: p.oportunidade })))
            const nomes = await nomesDasOrganizacoes(emAjuste.map((x) => x.c.organizacaoId))
            const ajustes = await Promise.all(emAjuste.map(async (x) => ({ ...x, pedidos: await listarAjustes(x.c.id).catch(() => []) })))
            for (const { c, o, pedidos } of ajustes) {
                const aberto = pedidos.find((p) => p.situacao === 'AGUARDANDO')
                if (!aberto) continue
                lista.push({
                    chave: `ajuste-${aberto.id}`,
                    data: aberto.prazoReenvio,
                    titulo: `${nomes.get(c.organizacaoId) ?? 'A organização'} precisa reenviar o ajuste`,
                    detalhe: `${o.titulo} · reenvio até ${formatarDataHora(aberto.prazoReenvio)}`,
                    para: `/provedor/candidaturas/${c.id}`,
                })
            }
            return lista.sort((a, b) => a.data.localeCompare(b.data))
        },
        [organizacaoId],
        !!organizacaoId,
    )

    const lista = notificacoes.dados ?? []
    const contar = (f: Filtro) => lista.filter((n) => f === 'TODAS' || n.tipo === f).length
    const abas: Aba<Filtro>[] = [
        { id: 'TODAS', rotulo: 'Todas', quantidade: contar('TODAS') },
        { id: 'PEDE_ACAO', rotulo: 'Pedem ação', quantidade: contar('PEDE_ACAO') },
        { id: 'INFORMATIVA', rotulo: 'Informativas', quantidade: contar('INFORMATIVA') },
    ]
    const visiveis = lista.filter((n) => filtro === 'TODAS' || n.tipo === filtro)
    const naoLidas = lista.filter((n) => !n.lidaEm).length

    async function ler(n: Notificacao) {
        if (n.lidaEm) return
        try {
            const lida = await marcarComoLida(n.id)
            notificacoes.definir(lista.map((x) => (x.id === lida.id ? lida : x)))
        } catch (e) {
            setErroAcao(mensagemDeErro(e))
        }
    }

    async function lerTodas() {
        setErroAcao(null)
        try {
            await marcarTodasComoLidas()
            await notificacoes.recarregar()
        } catch (e) {
            setErroAcao(mensagemDeErro(e))
        }
    }

    return (
        <CascaDoApp itens={MENU_PROVEDOR}>
            <Cabecalho
                titulo="Notificações e prazos"
                apoio="Avisos sobre as suas oportunidades. Os mais recentes ficam no topo."
                acoes={naoLidas > 0 && <Botao onClick={() => void lerTodas()}>Marcar todas como lidas</Botao>}
            />

            <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-start">
                <div className="flex min-w-0 flex-1 flex-col gap-4">
                    {erroAcao && <Aviso tipo="erro">{erroAcao}</Aviso>}
                    <AbasDeFiltro abas={abas} ativa={filtro} aoEscolher={setFiltro} rotulo="Filtrar notificações" />

                    {notificacoes.carregando && !notificacoes.dados && <Carregando />}
                    {notificacoes.erro && <ErroNaTela mensagem={notificacoes.erro} tentarDeNovo={() => void notificacoes.recarregar()} />}
                    {notificacoes.dados && visiveis.length === 0 && <Vazio titulo="Nenhuma notificação por aqui" />}

                    {visiveis.length > 0 && (
                        <ul className="overflow-hidden rounded-bloco border border-sutil bg-card shadow-card">
                            {visiveis.map((n) => (
                                <li
                                    key={n.id}
                                    className={`flex items-center gap-4 border-b border-sutil px-card py-4 last:border-b-0 ${n.lidaEm ? '' : 'bg-acento-suave/60'}`}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`size-2 shrink-0 rounded-full ${n.lidaEm ? 'bg-sutil' : 'bg-acento'}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => void ler(n)}
                                        className={`min-w-0 flex-1 rounded-card text-left ${ANEL_FOCO}`}
                                        aria-label={`${n.titulo}${n.lidaEm ? '' : ', não lida: marcar como lida'}`}
                                    >
                                        <span className="flex flex-wrap items-center gap-2">
                                            <span className="font-display text-bloco text-titulo">{n.titulo}</span>
                                            <span
                                                className={`rounded-badge px-2 py-0.5 text-selo ${
                                                    n.tipo === 'PEDE_ACAO' ? 'bg-aviso-fundo text-ocre' : 'bg-page text-secundario'
                                                }`}
                                            >
                                                {n.tipo === 'PEDE_ACAO' ? 'Pede ação' : 'Informativa'}
                                            </span>
                                            {!n.lidaEm && <span className="sr-only">não lida</span>}
                                        </span>
                                        {n.mensagem && <span className="mt-1 block text-apoio text-secundario">{n.mensagem}</span>}
                                    </button>
                                    <span className="shrink-0 text-legenda text-secundario">{formatarDataHora(n.criadaEm)}</span>
                                    {n.oportunidadeId && (
                                        <BotaoLink para={`/provedor/candidaturas?oportunidade=${n.oportunidadeId}`}>Abrir</BotaoLink>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <aside className="w-full shrink-0 lg:w-[344px]">
                    <Bloco titulo="Prazos que vencem" apoio="Envio das oportunidades abertas e reenvio dos ajustes.">
                        {prazos.carregando && !prazos.dados && <Carregando />}
                        {prazos.erro && <ErroNaTela mensagem={prazos.erro} tentarDeNovo={() => void prazos.recarregar()} />}
                        {prazos.dados && prazos.dados.length === 0 && <p className="text-apoio text-secundario">Nenhum prazo aberto.</p>}
                        {prazos.dados && prazos.dados.length > 0 && (
                            <ul className="flex flex-col divide-y divide-sutil">
                                {prazos.dados.map((p) => {
                                    const dias = diasAte(p.data.slice(0, 10))
                                    return (
                                        <li key={p.chave} className="py-3">
                                            <Link to={p.para} className="text-item text-titulo hover:underline">
                                                {p.titulo}
                                            </Link>
                                            <p className="text-legenda text-secundario">{p.detalhe}</p>
                                            <p className={`mt-1 text-selo ${dias <= 3 ? 'text-status-reprovada-texto' : 'text-ocre'}`}>
                                                {dias === 0 ? 'vence hoje' : dias === 1 ? 'vence amanhã' : `vence em ${dias} dias`} ·{' '}
                                                {formatarData(p.data)}
                                            </p>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </Bloco>
                </aside>
            </div>
        </CascaDoApp>
    )
}

export default ProvedorNotificacoes
