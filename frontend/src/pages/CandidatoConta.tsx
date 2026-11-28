import CascaDoApp from '../components/CascaDoApp'
import { candidaturasComOportunidade, emAndamento, rotaDaCandidatura } from '../components/candidato/apoio'
import { CustomButton } from '../components/CustomButton'
import { BlocoDoPapel, PaginaDeConta } from '../components/PaginaDeConta'
import { Carregando, ErroNaTela } from '../components/ui/Estados'
import { formatarData, rotuloDoEstado, ROTULO_TIPO_ORGANIZACAO, statusDoEstado } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_CANDIDATO } from '../navegacao/menus'
import { useSessao } from '../sessao/contexto'

/**
 * 15 e 16 · Candidato — conta · rota /candidato/conta
 *
 * Os dados da pessoa e os vínculos vêm da sessão (PaginaDeConta). O bloco do
 * meio mostra a candidatura mais recente da organização. A API ainda não tem a
 * edição dos dados da pessoa, então não há "editar perfil".
 */
export default function CandidatoConta() {
    const { perfilAtivo } = useSessao()
    const organizacaoId = perfilAtivo?.vinculo.organizacaoId
    const organizacao = perfilAtivo?.organizacao
    const { dados, carregando, erro, recarregar } = useDados(
        () => candidaturasComOportunidade(organizacaoId as number),
        [organizacaoId],
        !!organizacaoId,
    )

    const recente = dados?.[0]
    const abertas = (dados ?? []).filter((i) => emAndamento(i.candidatura.estado)).length

    return (
        <CascaDoApp itens={MENU_CANDIDATO}>
            <PaginaDeConta
                destaqueTitulo="Minha organização"
                destaque={
                    <div className="mt-3 flex flex-col gap-2">
                        <p className="text-item text-titulo">{perfilAtivo?.vinculo.organizacaoNome}</p>
                        <p className="text-apoio text-secundario">
                            {organizacao ? (ROTULO_TIPO_ORGANIZACAO[organizacao.tipo] ?? organizacao.tipo) : 'Candidato'}
                            {perfilAtivo?.vinculo.representante ? ' · você é o representante' : ''}
                        </p>
                        {dados && (
                            <p className="text-apoio text-secundario">
                                {dados.length} {dados.length === 1 ? 'candidatura' : 'candidaturas'} · {abertas} em andamento
                            </p>
                        )}
                        <CustomButton to="/candidato/organizacao" variant="neutro" size="auto" className="mt-2">
                            Ver perfil da organização
                        </CustomButton>
                    </div>
                }
            >
                {carregando && !dados ? (
                    <Carregando />
                ) : erro ? (
                    <ErroNaTela mensagem={erro} tentarDeNovo={recarregar} />
                ) : recente ? (
                    <BlocoDoPapel
                        titulo="Candidatura mais recente"
                        status={statusDoEstado(recente.candidatura.estado)}
                        rotuloDoStatus={rotuloDoEstado(recente.candidatura.estado)}
                        chamada={recente.oportunidade?.titulo ?? `Oportunidade ${recente.candidatura.oportunidadeId}`}
                        contexto={
                            recente.candidatura.enviadaEm
                                ? `Enviada em ${formatarData(recente.candidatura.enviadaEm)}`
                                : `Salva em ${formatarData(recente.candidatura.salvaEm ?? recente.candidatura.criadaEm)}`
                        }
                        explicacao={recente.candidatura.tituloProposta ?? 'Sem título da proposta ainda.'}
                        acao={rotaDaCandidatura(recente.candidatura).acao}
                        para={rotaDaCandidatura(recente.candidatura).para}
                    />
                ) : (
                    <BlocoDoPapel
                        titulo="Candidaturas"
                        status="rascunho"
                        rotuloDoStatus="Nenhuma"
                        chamada="Nenhuma candidatura ainda"
                        contexto={perfilAtivo?.vinculo.organizacaoNome ?? ''}
                        explicacao="Encontre uma oportunidade aberta e clique em Candidatar-se."
                        acao="Buscar oportunidades"
                        para="/candidato/oportunidades"
                    />
                )}
            </PaginaDeConta>
        </CascaDoApp>
    )
}
