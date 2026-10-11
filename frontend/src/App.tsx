import { useEffect, useState } from 'react'

type Ping = {
  servico: string
  momento: string
}

function App() {
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

  return (
      <main className="mx-auto max-w-xl p-8">
        <h1 className="text-2xl font-bold">Up Hub</h1>

        {erro && <p className="mt-4 text-red-600">Falhou: {erro}</p>}
        {!erro && !ping && <p className="mt-4">Consultando o backend...</p>}
        {ping && (
            <p className="mt-4">
              Conectado a <strong>{ping.servico}</strong>, que respondeu às {ping.momento}
            </p>
        )}
      </main>
  )
}

export default App