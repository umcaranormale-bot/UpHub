import type { ReactNode } from 'react'

import { CARTAO_COM_RESPIRO } from '../../estilos/classes'
import { CustomButton } from '../CustomButton'

/**
 * Os três estados de toda tela que busca dados: carregando, erro e vazio.
 * O quarto estado é a própria tela com os dados.
 */

export function Carregando({ tela = false, texto = 'Carregando…' }: { tela?: boolean; texto?: string }) {
    return (
        <div
            role="status"
            aria-live="polite"
            className={`flex items-center justify-center gap-3 text-apoio text-secundario ${tela ? 'min-h-screen' : 'py-12'}`}
        >
            <span className="size-4 animate-spin rounded-full border-2 border-sutil border-t-acento" aria-hidden="true" />
            {texto}
        </div>
    )
}

export function ErroNaTela({ mensagem, tentarDeNovo }: { mensagem: string; tentarDeNovo?: () => void }) {
    return (
        <div role="alert" className={`${CARTAO_COM_RESPIRO} flex flex-col items-start gap-3`}>
            <p className="text-bloco text-status-reprovada-texto">Não foi possível carregar</p>
            <p className="text-apoio text-secundario">{mensagem}</p>
            {tentarDeNovo && (
                <CustomButton variant="neutro" size="pequeno" onClick={tentarDeNovo}>
                    Tentar de novo
                </CustomButton>
            )}
        </div>
    )
}

export function Vazio({ titulo, children }: { titulo: string; children?: ReactNode }) {
    return (
        <div className={`${CARTAO_COM_RESPIRO} flex flex-col items-start gap-2`}>
            <p className="text-bloco text-titulo">{titulo}</p>
            {children && <div className="text-apoio text-secundario">{children}</div>}
        </div>
    )
}

/** Mensagem curta de sucesso ou erro depois de uma ação (salvar, enviar, aprovar). */
export function Aviso({ tipo, children }: { tipo: 'sucesso' | 'erro'; children: ReactNode }) {
    const cores =
        tipo === 'sucesso'
            ? 'border-status-aprovada-borda bg-status-aprovada-fundo text-status-aprovada-texto'
            : 'border-status-reprovada-borda bg-status-reprovada-fundo text-status-reprovada-texto'
    return (
        <p role={tipo === 'erro' ? 'alert' : 'status'} className={`rounded-card border px-4 py-3 text-apoio ${cores}`}>
            {children}
        </p>
    )
}
