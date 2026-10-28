import { useEffect, useState } from 'react'

type Ping = {
    servico: string
    momento: string
}

function StatusBackend() {
    const [ping, setPing] = useState<Ping | null>(null)
    const [erro, setErro] = useState<string | null>(null)

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/ping`)
            .then((resposta) => {
                if (!resposta.ok) {
                    throw new Error(`o servidor respondeu ${resposta.status}`)
                }
                return resposta.json()
            })
            .then(setPing)
            .catch((e: Error) => setErro(e.message))
    }, [])

    const estado = erro ? 'Backend indisponível' : ping ? `Conectado a ${ping.servico}` : 'Consultando o backend...'
    const cor = erro ? 'bg-secundario' : ping ? 'bg-trilha-investimento' : 'bg-sutil'

    return (
        <p className="flex items-center gap-2 text-legenda text-secundario" title={erro ?? ping?.momento ?? ''}>
            <span className={`inline-block h-2 w-2 rounded-full ${cor}`} aria-hidden="true" />
            {estado}
        </p>
    )
}

export default StatusBackend
