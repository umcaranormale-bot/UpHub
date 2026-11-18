import { useState } from 'react'

import { CustomButton } from '../components/CustomButton'
import CascaDoApp from '../components/CascaDoApp'
import SeloStatus, { type Status } from '../components/SeloStatus'
import { MENU_GESTAO } from '../navegacao/menus'

/**
 * 18 · Gestão do PD — aprovação de provedores · rota /provedores
 *
 * Fila das organizações que pediram permissão para publicar oportunidades.
 * Clicar numa linha abre a conferência embaixo da tabela.
 *
 * Dados simulados nesta etapa, conforme o Bloco 4: nenhuma chamada à API.
 */

interface Indicador {
    id: string
    rotulo: string
    valor: string
    cor: string
}

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

const COLUNAS = ['Organização', 'CNPJ', 'Tipo', 'Trilha', 'Pedido em', 'Situação']

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

            <ul className="mt-6 grid grid-cols-4 gap-5">
                {indicadores.map((indicador) => (
                    <li
                        key={indicador.id}
                        className="rounded-bloco border border-sutil bg-card p-card shadow-card"
                    >
                        <p className="text-item text-secundario">{indicador.rotulo}</p>
                        <p className={`mt-2 font-display text-tela ${indicador.cor}`}>
                            {indicador.valor}
                        </p>
                    </li>
                ))}
            </ul>

            <section
                aria-label="Fila de pedidos"
                className="mt-6 overflow-hidden rounded-bloco border border-sutil bg-card shadow-card"
            >
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-sutil bg-page">
                            {COLUNAS.map((coluna) => (
                                <th
                                    key={coluna}
                                    scope="col"
                                    className="px-card py-3 text-selo text-secundario uppercase"
                                >
                                    {coluna}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {provedores.map((linha) => (
                            <tr
                                key={linha.id}
                                aria-selected={linha.id === selecionado}
                                onClick={() => setSelecionado(linha.id)}
                                className={`cursor-pointer border-b border-sutil transition-colors duration-[var(--dur-rapida)] ease-padrao last:border-b-0 ${
                                    linha.id === selecionado
                                        ? 'bg-acento-suave'
                                        : 'hover:bg-page'
                                }`}
                            >
                                <td className="px-card py-4">
                                    <p className="text-item text-titulo">{linha.organizacao}</p>
                                    <p className="mt-1 text-apoio text-secundario">
                                        {linha.responsavel} · {linha.email}
                                    </p>
                                </td>
                                <td className="px-card py-4 text-apoio text-titulo">
                                    {linha.cnpj}
                                </td>
                                <td className="px-card py-4 text-apoio text-titulo">
                                    {linha.tipo}
                                </td>
                                <td className="px-card py-4 text-apoio text-titulo">
                                    {linha.trilha}
                                </td>
                                <td className="px-card py-4 text-apoio text-titulo">
                                    {linha.pedidoEm}
                                </td>
                                <td className="px-card py-4">
                                    <SeloStatus
                                        status={linha.status}
                                        rotulo={linha.rotulo}
                                        comPonto
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

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
                    <ul className="mt-5 grid grid-cols-4 gap-5">
                        {provedor.conferencias.map((conferencia) => (
                            <li
                                key={conferencia.rotulo}
                                className="rounded-card bg-page p-5"
                            >
                                <p className="text-apoio text-secundario">
                                    {conferencia.rotulo}
                                </p>
                                <p className="mt-1 break-words text-item text-titulo">
                                    {conferencia.valor}
                                </p>
                                <p
                                    className={`mt-1 text-apoio ${
                                        conferencia.confere
                                            ? 'text-status-aprovada-texto'
                                            : 'text-secundario'
                                    }`}
                                >
                                    {conferencia.nota}
                                </p>
                            </li>
                        ))}
                    </ul>
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
