import { useId } from 'react'

import type { Oportunidade } from '../../api/oportunidades'
import { ROTULO_TRILHA } from '../../estilos/formatos'
import { rotuloDaOportunidade } from './rotulos'

/** A lista de escolha da oportunidade, no topo das telas que trabalham com uma de cada vez. */
export function SeletorDeOportunidade({
    oportunidades,
    escolhida,
    aoEscolher,
}: {
    oportunidades: Oportunidade[]
    escolhida: Oportunidade | null
    aoEscolher: (id: number) => void
}) {
    const id = useId()
    return (
        <div className="flex items-center gap-2 rounded-card border border-sutil bg-card px-3 py-2">
            <label htmlFor={id} className="text-apoio text-secundario">
                Oportunidade
            </label>
            <select
                id={id}
                value={escolhida?.id ?? ''}
                onChange={(e) => aoEscolher(Number(e.target.value))}
                className="min-w-[240px] bg-transparent text-item text-titulo outline-none"
            >
                {oportunidades.map((o) => (
                    <option key={o.id} value={o.id}>
                        {o.titulo} · {ROTULO_TRILHA[o.trilhaCodigo]} · {rotuloDaOportunidade(o)}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default SeletorDeOportunidade
