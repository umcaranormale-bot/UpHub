import { useState } from 'react'

import { CustomButton } from '../components/CustomButton'
import CascaDoApp from '../components/CascaDoApp'
import SeloStatus, { type Status } from '../components/SeloStatus'
import { MENU_GESTAO } from '../navegacao/menus'
import Indicadores, { type Indicador } from '../components/Indicadores'
import TabelaSelecionavel, { type ColunaDaTabela } from '../components/TabelaSelecionavel'
import CartoesDeDetalhe from '../components/CartoesDeDetalhe'

/**
 * 18 · Gestão do PD — aprovação de provedores · rota /provedores
 *
 * Fila das organizações que pediram permissão para publicar oportunidades.
 * Clicar numa linha abre a conferência embaixo da tabela.
 *
 * Dados simulados nesta etapa, conforme o Bloco 4: nenhuma chamada à API.
 */


const indicadores: Indicador[] = [
    { id: 'analise', rotulo: 'Pedidos em análise', valor: '3', cor: 'text-ocre' },
    {
        id: 'aprovadas',
        rotulo: 'Aprovadas no mês',
        valor: '7',
        cor: 'text-status-aprovada-texto',
    },
    {
        id: 'recusadas',
        rotulo: 'Recusadas no mês',
        valor: '1',
        cor: 'text-status-reprovada-texto',
    },
    { id: 'tempo', rotulo: 'Tempo médio de análise', valor: '2 dias', cor: 'text-acento' },
]

interface Conferencia {
    rotulo: string
    valor: string
    nota: string
    confere: boolean
}

interface Provedor {
    id: number
    organizacao: string
    responsavel: string
    email: string
    cnpj: string
    tipo: string
    trilha: string
    pedidoEm: string
    status: Status
    rotulo: string
    conferencias: Conferencia[]
}

const provedores: Provedor[] = [
    {
        id: 1,
        organizacao: 'Instituto Recife Inova',
        responsavel: 'Beatriz Nunes',
        email: 'beatriz@recifeinova.org.br',
        cnpj: '44.555.666/0001-77',
        tipo: 'Órgão de fomento',
        trilha: 'Fomento',
        pedidoEm: '26/09/2026',
        status: 'pendente',
        rotulo: 'Aguardando',
        conferencias: [
            {
                rotulo: 'CNPJ',
                valor: '44.555.666/0001-77',
                nota: 'confere na base pública',
                confere: true,
            },
            {
                rotulo: 'E-mail institucional',
                valor: 'beatriz@recifeinova.org.br',
                nota: 'domínio bate com o CNPJ',
                confere: true,
            },
            {
                rotulo: 'Documento de comprovação',
                valor: 'estatuto-2026.pdf',
                nota: 'anexado em 26/09',
                confere: true,
            },
            { rotulo: 'Trilhas pedidas', valor: 'Fomento', nota: '—', confere: false },
        ],
    },
    {
        id: 2,
        organizacao: 'Investe Recife',
        responsavel: 'Paulo Lima',
        email: 'paulo@investerecife.com',
        cnpj: '11.222.333/0001-99',
        tipo: 'Investidor',
        trilha: 'Investimento',
        pedidoEm: '25/09/2026',
        status: 'pendente',
        rotulo: 'Aguardando',
        conferencias: [],
    },
    {
        id: 3,
        organizacao: 'Movetech Soluções',
        responsavel: 'Carla Dias',
        email: 'carla@movetech.com.br',
        cnpj: '22.333.444/0001-55',
        tipo: 'Empresa parceira',
        trilha: 'Formação',
        pedidoEm: '24/09/2026',
        status: 'pendente',
        rotulo: 'Aguardando',
        conferencias: [],
    },
    {
        id: 4,
        organizacao: 'Órgão de Fomento PE',
        responsavel: 'Ana Freire',
        email: 'ana.freire@fomento.pe.gov.br',
        cnpj: '55.666.777/0001-88',
        tipo: 'Órgão de fomento',
        trilha: 'Fomento',
        pedidoEm: '10/08/2026',
        status: 'aprovada',
        rotulo: 'Aprovada',
        conferencias: [],
    },
]

const COLUNAS: ColunaDaTabela<Provedor>[] = [
    {
        rotulo: 'Organização',
        celula: (l) => (
            <>
                <p className="text-item text-titulo">{l.organizacao}</p>
                <p className="mt-1 text-apoio text-secundario">
                    {l.responsavel} · {l.email}
                </p>
            </>
        ),
    },
    { rotulo: 'CNPJ', celula: (l) => <span className="text-apoio text-titulo">{l.cnpj}</span> },
    { rotulo: 'Tipo', celula: (l) => <span className="text-apoio text-titulo">{l.tipo}</span> },
    { rotulo: 'Trilha', celula: (l) => <span className="text-apoio text-titulo">{l.trilha}</span> },
    {
        rotulo: 'Pedido em',
        celula: (l) => <span className="text-apoio text-titulo">{l.pedidoEm}</span>,
    },
    {
        rotulo: 'Situação',
        celula: (l) => <SeloStatus status={l.status} rotulo={l.rotulo} comPonto />,
    },
]

function AprovacaoProvedores() {
    const [selecionado, setSelecionado] = useState(provedores[0].id)

    const provedor = provedores.find((p) => p.id === selecionado) ?? provedores[0]

    return (
        <CascaDoApp
            organizacao="Porto Digital"
            papel="Gestão do PD"
            iniciais="MV"
            nome="Marcos Vilela"
            itens={MENU_GESTAO}
            voltarPara="/painel"
        >
            <h1 className="font-display text-tela text-titulo">Aprovação de provedores</h1>
            <p className="mt-2 text-apoio text-secundario">
                Organizações que pediram permissão para publicar oportunidades. Enquanto o
                pedido de publicação não é aprovado, ela navega mas não publica.
            </p>

            <div className="mt-6">
                <Indicadores itens={indicadores} rotulo="Indicadores do mês" />
            </div>

            <div className="mt-6">
                <TabelaSelecionavel
                    rotulo="Fila de pedidos"
                    colunas={COLUNAS}
                    linhas={provedores}
                    chave={(l) => l.id}
                    selecionada={selecionado}
                    aoSelecionar={(id) => setSelecionado(Number(id))}
                />
            </div>

            <section
                aria-label={`Conferência de ${provedor.organizacao}`}
                className="mt-6 rounded-bloco border border-sutil bg-card p-card shadow-card"
            >
                <div className="flex items-center gap-3">
                    <h2 className="font-display text-h3 text-titulo">
                        {provedor.organizacao}
                    </h2>
                    <SeloStatus status={provedor.status} rotulo={provedor.rotulo} comPonto />
                    <span className="ml-auto text-apoio text-secundario">
                        pedido em {provedor.pedidoEm}
                    </span>
                </div>

                {provedor.conferencias.length === 0 ? (
                    <p className="mt-5 rounded-card bg-page p-5 text-apoio text-secundario">
                        A conferência de CNPJ, domínio e documento aparece aqui quando o
                        pedido é aberto. Esta linha ainda não foi conferida.
                    </p>
                ) : (
                    <div className="mt-5">
                        <CartoesDeDetalhe
                            itens={provedor.conferencias.map((c) => ({
                                rotulo: c.rotulo,
                                valor: c.valor,
                                nota: c.nota,
                                confirmado: c.confere,
                            }))}
                        />
                    </div>
                )}

                <div className="mt-6 flex items-center gap-4 border-t border-sutil pt-5">
                    <CustomButton variant="aprovar" size="auto">
                        Aprovar e liberar publicação
                    </CustomButton>
                    <CustomButton variant="reprovar" size="auto">
                        Recusar
                    </CustomButton>
                    <p className="ml-auto text-apoio text-secundario">
                        A decisão fica registrada no histórico de auditoria.
                    </p>
                </div>
            </section>
        </CascaDoApp>
    )
}

export default AprovacaoProvedores
