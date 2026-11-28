import { Link } from 'react-router-dom'

import { pesosDoMatching, recomendadas } from '../api/matching'
import CascaDoApp from '../components/CascaDoApp'
import CartaoDeOportunidade from '../components/candidato/CartaoDeOportunidade'
import { LIMITE_RECOMENDADAS, trilhasDoTipo } from '../components/candidato/apoio'
import useFavoritas from '../components/candidato/useFavoritas'
import { CustomButton } from '../components/CustomButton'
import { Aviso, Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { ROTULO_TRILHA } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_CANDIDATO } from '../navegacao/menus'
import { useSessao } from '../sessao/contexto'

/**
 * 63 · Candidato — oportunidades recomendadas (matching) · rota /candidato/recomendadas
 *
 * As oportunidades abertas em ordem de compatibilidade (0 a 100), cada uma
 * com o porquê de cada critério. Os pesos por trilha vêm do back-end.
 */

const ROTULO_CRITERIO: Record<string, string> = {
    ELEGIBILIDADE: 'elegibilidade',
    AREA: 'área',
    PERFIL: 'perfil',
    TESE: 'tese',
    COMPETENCIAS: 'competências',
}

export default function CandidatoRecomendadas() {
    const { perfilAtivo } = useSessao()
    const organizacaoId = perfilAtivo?.vinculo.organizacaoId
    const tipo = perfilAtivo?.organizacao?.tipo

    const lista = useDados(
        () => recomendadas(organizacaoId as number, LIMITE_RECOMENDADAS),
        [organizacaoId],
        !!organizacaoId,
    )
    const pesos = useDados(() => pesosDoMatching(), [])
    const favoritas = useFavoritas(organizacaoId)

    const trilhasDaOrganizacao = trilhasDoTipo(tipo)
    const textoDosPesos = (pesos.dados ?? [])
        .filter((p) => trilhasDaOrganizacao.includes(p.trilhaCodigo))
        .map(
            (p) =>
                `${ROTULO_TRILHA[p.trilhaCodigo]}: ${Object.entries(p.pesos)
                    .map(([c, v]) => `${ROTULO_CRITERIO[c] ?? c.toLowerCase()} ${v}`)
                    .join(', ')}`,
        )
        .join('. ')

    return (
        <CascaDoApp itens={MENU_CANDIDATO} voltarPara="/candidato/oportunidades">
            <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1">
                    <h1 className="font-display text-tela text-titulo">Recomendadas para você</h1>
                    <p className="mt-1 text-apoio text-secundario">
                        {perfilAtivo?.vinculo.organizacaoNome} · ordenadas pela compatibilidade com o perfil da organização
                    </p>
                </div>
                <CustomButton to="/candidato/oportunidades" variant="neutro" size="auto">
                    Ver todas as oportunidades
                </CustomButton>
            </div>

            <p className="mt-6 rounded-bloco bg-acento-suave p-card text-apoio text-titulo">
                A compatibilidade vai de 0 a 100 e soma critérios com peso por trilha.
                {textoDosPesos && ` ${textoDosPesos}.`} Um critério sem dado sai da conta, e os outros pesos se redistribuem.
            </p>

            {favoritas.erroDaAcao && (
                <div className="mt-4">
                    <Aviso tipo="erro">{favoritas.erroDaAcao}</Aviso>
                </div>
            )}

            <div className="mt-5">
                {lista.carregando && !lista.dados ? (
                    <Carregando />
                ) : lista.erro ? (
                    <ErroNaTela mensagem={lista.erro} tentarDeNovo={lista.recarregar} />
                ) : !lista.dados || lista.dados.length === 0 ? (
                    <Vazio titulo="Nenhuma recomendação agora">
                        Não há oportunidade aberta em que a organização seja elegível. Completar o{' '}
                        <Link to="/candidato/organizacao" className="text-acento underline">
                            perfil da organização
                        </Link>{' '}
                        (setor, estágio, descrição) ajuda o matching.
                    </Vazio>
                ) : (
                    <ul className="flex flex-col gap-4">
                        {lista.dados.map((m) => (
                            <li key={m.oportunidadeId}>
                                <CartaoDeOportunidade
                                    match={m}
                                    detalhado
                                    favorita={favoritas.ids ? favoritas.ids.has(m.oportunidadeId) : undefined}
                                    aoAlternarFavorita={() => favoritas.alternar(m.oportunidadeId)}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <p className="mt-6 text-legenda text-secundario">
                Oportunidades em que a organização é inelegível não aparecem aqui. Pendente quer dizer que falta um dado do perfil
                para conferir alguma regra: complete o perfil da organização.
            </p>
        </CascaDoApp>
    )
}
