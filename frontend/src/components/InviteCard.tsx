import { useState, type FormEvent } from 'react'

import { CustomButton } from './CustomButton'
import { Campo } from './ui/Campo'

/**
 * 45 · Aceitar convite — o código do convite. Quem vem pelo link do e-mail
 * nem vê este cartão: o código já vem na URL (/convite?codigo=...).
 */
interface InviteCardProps {
    codigoInicial?: string
    aoValidar: (codigo: string) => void
}

export default function InviteCard({ codigoInicial = '', aoValidar }: InviteCardProps) {
    const [codigo, setCodigo] = useState(codigoInicial)

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const limpo = codigo.trim()
        if (limpo) aoValidar(limpo)
    }

    return (
        <section className="w-full max-w-md rounded-modal border border-sutil bg-card p-8 shadow-card">
            <h1 className="text-h3 font-bold text-titulo">Aceitar convite</h1>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
                <Campo
                    rotulo="Código do convite"
                    placeholder="Cole aqui o código do convite"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    autoComplete="off"
                    required
                />

                <CustomButton type="submit" variant="aprovar" size="grande">
                    Validar código
                </CustomButton>

                <p className="text-apoio text-acento">Veio pelo link do e-mail? O código já vem preenchido.</p>
            </form>
        </section>
    )
}
