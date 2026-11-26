import PaginaDeConta, { BlocoDoPapel } from '../components/PaginaDeConta'

/** 61 · Gestão do PD — conta (Marcos Vilela) · rota /conta/gestao */
function ContaGestao() {
    return (
        <div>
            <PaginaDeConta
                pessoa={{
                    iniciais: 'MV',
                    nome: 'Marcos Vilela',
                    email: 'marcos@portodigital.org.br',
                    telefone: '(81) 9 9301-7744',
                    funcao: 'Gestão do ecossistema',
                    criadaEm: '10/02/2026',
                    id: 'USR-0021',
                }}
                destaqueTitulo="Alocações de mentores"
                destaque={
                    <>
                        <div className="mt-3 rounded-card bg-status-aprovada-fundo px-4 py-3">
                            <p className="text-bloco text-status-aprovada-texto">
                                5 alocações ativas
                            </p>
                            <p className="mt-1 text-apoio text-status-aprovada-texto">
                                38 h doadas no mês
                            </p>
                        </div>
                        <p className="mt-3 text-apoio text-secundario">
                            Os números vêm do painel do ecossistema e da fila de mentores.
                        </p>
                    </>
                }
                vinculos={[{ organizacao: 'Porto Digital', papel: 'Gestão do PD' }]}
            >
                <BlocoDoPapel
                    titulo="Pendências da gestão"
                    status="pendente"
                    rotuloDoStatus="Em aberto"
                    chamada="Painel do ecossistema"
                    contexto="2 squads sem mentor · 1 convite pendente · 2º pedido de provedor"
                    explicacao="Os detalhes ficam no painel e nas filas do menu lateral."
                    acao="Abrir painel"
                />
            </PaginaDeConta>
        </div>
    )
}

export default ContaGestao
