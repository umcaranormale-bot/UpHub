import type { ReactNode } from 'react'

import type { TipoOrganizacao } from '../api/organizacoes'
import { ANEL_FOCO, CARTAO_COM_RESPIRO, TRANSICAO_COR } from '../estilos/classes'
import { GRUPOS_DE_TIPO } from './acesso/tiposDeOrganizacao'

/**
 * Escolha do tipo da organização, nos dois grupos: quem se candidata e quem
 * oferece oportunidades. Usado no cadastro (tela 14) e na nova organização (tela 68).
 */
interface AccountTypeSelectorProps {
    value: TipoOrganizacao | null
    onChange: (tipo: TipoOrganizacao) => void
    titulo?: string
    descricao?: string
    /** Conteúdo abaixo dos grupos (o aviso do provedor, por exemplo). */
    children?: ReactNode
}

export default function AccountTypeSelector({
    value,
    onChange,
    titulo = 'Qual é o seu perfil?',
    descricao,
    children,
}: AccountTypeSelectorProps) {
    return (
        <section className={CARTAO_COM_RESPIRO}>
            <h2 className="text-bloco text-titulo">{titulo}</h2>
            {descricao && <p className="mt-1 text-apoio text-secundario">{descricao}</p>}

            {GRUPOS_DE_TIPO.map((grupo) => (
                <fieldset key={grupo.papel} className="mt-4">
                    <legend className="mb-2 text-item text-secundario">{grupo.titulo}</legend>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {grupo.opcoes.map((opcao) => {
                            const marcado = value === opcao.tipo
                            return (
                                <label
                                    key={opcao.tipo}
                                    className={`flex cursor-pointer flex-col gap-1 rounded-card border p-3 ${TRANSICAO_COR} has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-acento ${
                                        marcado
                                            ? 'border-acento bg-acento-suave ring-1 ring-acento'
                                            : 'border-sutil bg-card hover:border-acento'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="tipoDaOrganizacao"
                                            value={opcao.tipo}
                                            checked={marcado}
                                            onChange={() => onChange(opcao.tipo)}
                                            className={`size-4 accent-acento ${ANEL_FOCO}`}
                                        />
                                        <span className={`text-item ${marcado ? 'text-acento' : 'text-titulo'}`}>
                                            {opcao.rotulo}
                                        </span>
                                        {grupo.papel === 'PROVEDOR' && (
                                            <span className="sr-only">(precisa da aprovação da gestão para publicar)</span>
                                        )}
                                    </span>
                                    <span className="pl-6 text-legenda text-secundario">{opcao.descricao}</span>
                                </label>
                            )
                        })}
                    </div>
                </fieldset>
            ))}

            {children}
        </section>
    )
}
