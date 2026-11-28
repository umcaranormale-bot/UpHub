import { useState } from 'react'

import AbasDeFiltro, { type Aba } from '../components/AbasDeFiltro'
import CascaDoApp from '../components/CascaDoApp'
import {
    candidaturasComOportunidade,
    emAndamento,
    nomesDasOrganizacoes,
    rotaDaCandidatura,
    type CandidaturaComOportunidade,
} from '../components/candidato/apoio'
import { CustomButton } from '../components/CustomButton'
import SeloDeTrilha from '../components/SeloDeTrilha'
import SeloStatus from '../components/SeloStatus'
import { Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { CARTAO_COM_RESPIRO } from '../estilos/classes'
import { formatarData, formatarDataHora, rotuloDoEstado, statusDoEstado, trilhaDoSelo } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_CANDIDATO } from '../navegacao/menus'
import { useSessao } from '../sessao/contexto'

/**
 * 21 · Candidato — minhas candidaturas · rota /candidato/candidaturas
 *
 * Todas as candidaturas da organização, da mais recente para a mais antiga,
 * com o estado e o próximo passo (continuar, corrigir, acompanhar).
 */

type IdAba = 'todas' | 'andamento' | 'decididas'

export default function CandidatoCandidaturas() {
    const { perfilAtivo } = useSessao()
    const organizacaoId = perfilAtivo?.vinculo.organizacaoId
    const { dados, carregando, erro, recarregar } = useDados(
        async () => {
            const lista = await candidaturasComOportunidade(organizacaoId as number)
            const provedores = await nomesDasOrganizacoes(
                lista.flatMap((i) => (i.oportunidade ? [i.oportunidade.organizacaoId] : [])),
            )
            return { lista, provedores }
        },
        [organizacaoId],
        !!organizacaoId,
    )
    const [aba, setAba] = useState<IdAba>('todas')

    const lista = dados?.lista ?? []
    const andamento = lista.filter((i) => emAndamento(i.candidatura.estado))
    const decididas = lista.filter((i) => !emAndamento(i.candidatura.estado))
    const abas: Aba<IdAba>[] = [
        { id: 'todas', rotulo: 'Todas', quantidade: lista.length },
        { id: 'andamento', rotulo: 'Em andamento', quantidade: andamento.length },
        { id: 'decididas', rotulo: 'Decididas', quantidade: decididas.length },
    ]
    const visiveis = aba === 'todas' ? lista : aba === 'andamento' ? andamento : decididas

    return (
        <CascaDoApp itens={MENU_CANDIDATO}>
            <h1 className="font-display text-tela text-titulo">Minhas candidaturas</h1>
            <p className="mt-1 text-apoio text-secundario">
                Escolha uma candidatura para ver a linha do tempo e o resultado. Elas pertencem a{' '}
                {perfilAtivo?.vinculo.organizacaoNome}.
            </p>

            {carregando && !dados ? (
                <Carregando />
            ) : erro ? (
                <div className="mt-6">
                    <ErroNaTela mensagem={erro} tentarDeNovo={recarregar} />
                </div>
            ) : lista.length === 0 ? (
                <div className="mt-6">
                    <Vazio titulo="Nenhuma candidatura ainda">
                        Encontre uma oportunidade aberta e clique em Candidatar-se.
                        <div className="mt-3">
                            <CustomButton to="/candidato/oportunidades" variant="aprovar" size="auto">
                                Buscar oportunidades
                            </CustomButton>
                        </div>
                    </Vazio>
                </div>
            ) : (
                <>
                    <div className="mt-5">
                        <AbasDeFiltro abas={abas} ativa={aba} aoEscolher={setAba} rotulo="Filtrar candidaturas" />
                    </div>
                    {visiveis.length === 0 ? (
                        <div className="mt-5">
                            <Vazio titulo="Nenhuma candidatura nesta aba" />
                        </div>
                    ) : (
                        <ul className="mt-5 flex flex-col gap-4">
                            {visiveis.map((item) => (
                                <li key={item.candidatura.id}>
                                    <CartaoDaCandidatura item={item} provedor={dados?.provedores.get(item.oportunidade?.organizacaoId ?? -1)} />
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </CascaDoApp>
    )
}

function linhaDeApoio({ candidatura: c }: CandidaturaComOportunidade): string {
    const partes: string[] = []
    if (c.enviadaEm) partes.push(`Enviada em ${formatarData(c.enviadaEm)}`)
    else if (c.salvaEm) partes.push(`Salva em ${formatarDataHora(c.salvaEm)}`)
    else partes.push(`Criada em ${formatarData(c.criadaEm)}`)
    if (c.tituloProposta) partes.push(c.tituloProposta)
    if (c.estado === 'LISTA_DE_ESPERA' && c.posicaoLista) partes.push(`posição ${c.posicaoLista} na lista de espera`)
    return partes.join(' · ')
}

function CartaoDaCandidatura({ item, provedor }: { item: CandidaturaComOportunidade; provedor?: string }) {
    const { candidatura: c, oportunidade } = item
    const destino = rotaDaCandidatura(c)
    const principal = c.estado === 'RASCUNHO' || c.estado === 'AJUSTE'
    return (
        <article className={`${CARTAO_COM_RESPIRO} flex flex-wrap items-center gap-4`}>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    {oportunidade && <SeloDeTrilha trilha={trilhaDoSelo(oportunidade.trilhaCodigo)} />}
                    {provedor && <span className="text-apoio text-secundario">{provedor}</span>}
                    {oportunidade?.suspensaEm && <SeloStatus status="rascunho" rotulo="Pausada" />}
                </div>
                <h2 className="mt-2 font-display text-bloco text-titulo">
                    {oportunidade?.titulo ?? `Oportunidade ${c.oportunidadeId}`}
                </h2>
                <p className="mt-1 text-apoio text-secundario">{linhaDeApoio(item)}</p>
            </div>
            <SeloStatus status={statusDoEstado(c.estado)} rotulo={rotuloDoEstado(c.estado)} comPonto />
            <CustomButton to={destino.para} variant={principal ? 'aprovar' : 'neutro'} size="auto">
                {destino.acao}
            </CustomButton>
        </article>
    )
}
