import { useState, type FormEvent } from 'react'

import { mensagemDeErro } from '../api/erros'
import { cadastrarOrganizacao, type TipoOrganizacao } from '../api/organizacoes'
import { cadastrarSquad } from '../api/squads'
import AccountTypeSelector from '../components/AccountTypeSelector'
import CascaDoApp from '../components/CascaDoApp'
import { CustomButton } from '../components/CustomButton'
import { esquecerTipoEscolhido, lerTipoEscolhido, papelDoTipo } from '../components/acesso/tiposDeOrganizacao'
import { useEntrarNoPerfilNovo } from '../components/acesso/useEntrarNoPerfilNovo'
import { Campo, CampoTexto } from '../components/ui/Campo'
import { Aviso } from '../components/ui/Estados'
import { CARTAO_COM_RESPIRO } from '../estilos/classes'
import { ROTULO_TIPO_ORGANIZACAO } from '../estilos/formatos'
import { CONTA_DA_AREA } from '../navegacao/areas'
import { useSessao } from '../sessao/contexto'

/**
 * 68 · Conta — nova organização (tipos e papel) · rota /conta/nova-organizacao
 *
 * Quem entra sem nenhum vínculo cai aqui depois do primeiro login; quem já tem
 * vínculo chega pelo menu da conta. Quem cadastra vira o representante, com o
 * papel do grupo do tipo. A squad nasce em dois passos (organização e squad).
 * O provedor novo ainda não publica: o escolherPerfil() leva para o pedido de
 * permissão (/provedor/pedido).
 */

const VAZIO = { nome: '', cnpj: '', setor: '', descricao: '', sedeCidade: '', sedeUf: '', anoFundacao: '' }

function texto(valor: string): string | undefined {
    const limpo = valor.trim()
    return limpo === '' ? undefined : limpo
}

function AcessoNovaOrganizacao() {
    const { perfilAtivo } = useSessao()
    const [tipo, setTipo] = useState<TipoOrganizacao | null>(lerTipoEscolhido)
    const [dados, setDados] = useState(VAZIO)
    const [erro, setErro] = useState<string | null>(null)
    const [enviando, setEnviando] = useState(false)
    // squad cuja organização já foi criada, mas o cadastro da squad falhou: o próximo envio só repete a squad
    const [squadPendente, setSquadPendente] = useState<number | null>(null)

    const entrarNoPerfilNovo = useEntrarNoPerfilNovo(() => {
        setEnviando(false)
        setErro('A organização foi criada, mas não deu para abrir o perfil novo. Saia e entre de novo.')
    })

    const voltar = perfilAtivo ? CONTA_DA_AREA[perfilAtivo.area] : undefined
    const ehProvedor = tipo !== null && papelDoTipo(tipo) === 'PROVEDOR'

    function mudar(campo: keyof typeof VAZIO, valor: string) {
        setDados((atual) => ({ ...atual, [campo]: valor }))
    }

    async function criar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setErro(null)
        if (!tipo) {
            setErro('Escolha o tipo da organização.')
            return
        }
        setEnviando(true)
        try {
            let organizacaoId = squadPendente
            if (organizacaoId === null) {
                const ano = dados.anoFundacao.trim()
                const criada = await cadastrarOrganizacao({
                    tipo,
                    papel: papelDoTipo(tipo),
                    nome: dados.nome.trim(),
                    cnpj: texto(dados.cnpj),
                    setor: texto(dados.setor),
                    descricao: texto(dados.descricao),
                    sedeCidade: texto(dados.sedeCidade),
                    sedeUf: texto(dados.sedeUf),
                    anoFundacao: ano === '' ? undefined : Number(ano),
                })
                organizacaoId = criada.id
            }
            if (tipo === 'SQUAD') {
                try {
                    await cadastrarSquad({ organizacaoId, descricao: texto(dados.descricao) })
                } catch (e) {
                    setSquadPendente(organizacaoId)
                    throw e
                }
            }
            esquecerTipoEscolhido()
            const id = organizacaoId
            await entrarNoPerfilNovo((p) => p.vinculo.organizacaoId === id)
        } catch (e) {
            setErro(mensagemDeErro(e))
            setEnviando(false)
        }
    }

    return (
        <CascaDoApp itens={[]} semMenu voltarPara={voltar}>
            <form onSubmit={(e) => void criar(e)} className="mx-auto flex max-w-6xl flex-col gap-6">
                <div className="flex flex-wrap items-start gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="font-display text-tela text-titulo">Nova organização</h1>
                        <p className="mt-1 text-apoio text-secundario">
                            O tipo decide o papel: quem se candidata ou quem oferece oportunidades. Você entra
                            como representante.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {voltar && (
                            <CustomButton to={voltar} variant="neutro" size="medio">
                                Cancelar
                            </CustomButton>
                        )}
                        <CustomButton type="submit" variant="aprovar" size="auto" disabled={enviando}>
                            {enviando ? 'Criando…' : squadPendente !== null ? 'Concluir a squad' : 'Criar organização'}
                        </CustomButton>
                    </div>
                </div>

                {!perfilAtivo && (
                    <p role="status" className="rounded-card border border-sutil bg-acento-suave px-4 py-3 text-apoio text-titulo">
                        Você ainda não faz parte de nenhuma organização. Cadastre a organização em que você atua para
                        começar. Mentor e avaliador não se cadastram aqui: entram pelo link do convite que chega por
                        e-mail.
                    </p>
                )}

                <AccountTypeSelector
                    value={tipo}
                    onChange={(novo) => {
                        if (squadPendente === null) setTipo(novo)
                    }}
                    titulo="Tipo da organização"
                    descricao={squadPendente !== null ? 'A organização já foi criada: falta só registrar a squad.' : undefined}
                >
                    <p
                        className={`mt-4 rounded-card border px-4 py-3 text-apoio ${
                            ehProvedor
                                ? 'border-aviso-borda bg-aviso-fundo text-alerta'
                                : 'border-sutil bg-page text-secundario'
                        }`}
                    >
                        Quem oferece oportunidades começa sem permissão de publicar: depois de criar, peça a
                        permissão de provedor e aguarde a aprovação da gestão do Porto Digital.
                    </p>
                </AccountTypeSelector>

                <section className={CARTAO_COM_RESPIRO}>
                    <h2 className="text-bloco text-titulo">Dados</h2>
                    <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Campo
                            rotulo="Nome"
                            value={dados.nome}
                            onChange={(e) => mudar('nome', e.target.value)}
                            required
                            maxLength={200}
                            placeholder={tipo ? `Nome da ${ROTULO_TIPO_ORGANIZACAO[tipo].toLowerCase()}` : 'Nome da organização'}
                            disabled={squadPendente !== null}
                        />
                        <Campo
                            rotulo="CNPJ (opcional)"
                            value={dados.cnpj}
                            onChange={(e) => mudar('cnpj', e.target.value)}
                            inputMode="numeric"
                            maxLength={18}
                            placeholder="00.000.000/0000-00"
                            disabled={squadPendente !== null}
                        />
                        <Campo
                            rotulo="Setor (opcional)"
                            value={dados.setor}
                            onChange={(e) => mudar('setor', e.target.value)}
                            maxLength={80}
                            placeholder="Ex.: Tecnologia da informação"
                            disabled={squadPendente !== null}
                        />
                        <Campo
                            rotulo="Cidade da sede (opcional)"
                            value={dados.sedeCidade}
                            onChange={(e) => mudar('sedeCidade', e.target.value)}
                            maxLength={80}
                            placeholder="Ex.: Recife"
                            disabled={squadPendente !== null}
                        />
                        <Campo
                            rotulo="UF (opcional)"
                            value={dados.sedeUf}
                            onChange={(e) => mudar('sedeUf', e.target.value)}
                            maxLength={2}
                            pattern="[A-Za-z]{2}"
                            title="Duas letras, como PE"
                            placeholder="PE"
                            disabled={squadPendente !== null}
                        />
                        <Campo
                            rotulo="Ano de fundação (opcional)"
                            type="number"
                            value={dados.anoFundacao}
                            onChange={(e) => mudar('anoFundacao', e.target.value)}
                            min={1800}
                            max={new Date().getFullYear()}
                            placeholder="Ex.: 2021"
                            disabled={squadPendente !== null}
                        />
                    </div>
                    <div className="mt-4">
                        <CampoTexto
                            rotulo="Descrição (opcional)"
                            ajuda="O que a organização faz, para quem e em que área. O matching usa este texto para sugerir oportunidades."
                            value={dados.descricao}
                            onChange={(e) => mudar('descricao', e.target.value)}
                            placeholder={
                                tipo === 'SQUAD'
                                    ? 'Conte o que a squad faz e quais competências o time tem.'
                                    : 'Conte o que a organização faz, para quem e em que área.'
                            }
                        />
                    </div>
                </section>

                {erro && <Aviso tipo="erro">{erro}</Aviso>}
            </form>
        </CascaDoApp>
    )
}

export default AcessoNovaOrganizacao
