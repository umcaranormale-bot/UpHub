import { useAuth } from '../contexts/AuthContext'
import { CustomButton } from '../components/CustomButton'
import PaginaDeConta from '../components/PaginaDeConta'
import { ROTULO_DO_PAPEL } from '../navegacao/papeis'

function iniciaisDe(nome: string) {
    const partes = nome.trim().split(/\s+/)
    const primeira = partes[0]?.[0] ?? ''
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
    return (primeira + ultima).toUpperCase()
}

function formatarData(data: string) {
    const convertida = new Date(data)
    return Number.isNaN(convertida.getTime())
        ? data
        : convertida.toLocaleDateString('pt-BR')
}

/**
 * ContaPage — "Minha conta" geral, em /conta.
 *
 * Usa o mesmo miolo das telas de conta por papel (PaginaDeConta), mas com os
 * dados da sessão e sem bloco de papel: serve para quem ainda não tem
 * vínculo, logo depois do primeiro login.
 */
export default function ContaPage() {
    const { sessao } = useAuth()

    // Dentro do PrivateRoute a sessão sempre existe; isto é para o TypeScript.
    if (!sessao) return null

    const { pessoa } = sessao

    const vinculosAtivos = sessao.vinculos.filter((v) => v.encerradoEm === null)

    return (
        <PaginaDeConta
            pessoa={{
                iniciais: iniciaisDe(pessoa.nome),
                nome: pessoa.nome,
                email: pessoa.email,
                telefone: pessoa.telefone ?? '—',
                funcao: vinculosAtivos[0]?.funcao ?? '—',
                criadaEm: formatarData(pessoa.criadaEm),
                id: String(pessoa.id),
            }}
            vinculos={vinculosAtivos.map((v) => ({
                organizacao: v.organizacaoNome,
                papel: ROTULO_DO_PAPEL[v.papel],
            }))}
            destaqueTitulo={
                vinculosAtivos.length === 0 ? 'Você ainda não tem vínculo' : 'Nova organização'
            }
            destaque={
                <>
                    <p className="mt-2 text-apoio text-secundario">
                        {vinculosAtivos.length === 0
                            ? 'Cadastre a organização em que você atua para escolher seu papel e liberar as áreas do sistema.'
                            : 'Você pode ter mais de um vínculo: cadastre outra organização em que atua.'}
                    </p>
                    <CustomButton
                        to="/organizacoes/nova"
                        variant="aprovar"
                        size="grande"
                        className="mt-4"
                    >
                        Cadastrar organização
                    </CustomButton>
                </>
            }
        >
            {null}
        </PaginaDeConta>
    )
}