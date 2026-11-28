import { useState } from 'react'

import type { Match } from '../../api/matching'
import { ANEL_FOCO, CARTAO_COM_RESPIRO, TRANSICAO_COR } from '../../estilos/classes'
import { formatarData, trilhaDoSelo } from '../../estilos/formatos'
import { CustomButton } from '../CustomButton'
import SeloDeTrilha from '../SeloDeTrilha'
import SeloStatus from '../SeloStatus'
import { diasAteData, textoDosDias } from './apoio'
import { BarrasDoMatch, SeloDaElegibilidade } from './Blocos'

/** Botão de favoritar (estrela). Só aparece quando a lista de favoritas carregou. */
export function BotaoFavorito({
    favorita,
    titulo,
    aoAlternar,
}: {
    favorita: boolean
    titulo: string
    aoAlternar: () => Promise<void>
}) {
    const [ocupado, setOcupado] = useState(false)
    return (
        <button
            type="button"
            aria-pressed={favorita}
            aria-label={favorita ? `Tirar ${titulo} das favoritas` : `Favoritar ${titulo}`}
            title={favorita ? 'Tirar das favoritas' : 'Favoritar'}
            disabled={ocupado}
            onClick={async () => {
                setOcupado(true)
                try {
                    await aoAlternar()
                } finally {
                    setOcupado(false)
                }
            }}
            className={`grid size-9 place-items-center rounded-card border border-sutil text-bloco ${
                favorita ? 'bg-acento-suave text-acento' : 'bg-card text-secundario hover:text-acento'
            } ${TRANSICAO_COR} ${ANEL_FOCO} disabled:opacity-50`}
        >
            <span aria-hidden="true">{favorita ? '★' : '☆'}</span>
        </button>
    )
}

/**
 * Uma oportunidade aberta, vinda do matching: trilha, título, área, prazo,
 * elegibilidade e a compatibilidade. Com `detalhado`, mostra o porquê da nota.
 */
export function CartaoDeOportunidade({
    match,
    detalhado = false,
    favorita,
    aoAlternarFavorita,
}: {
    match: Match
    detalhado?: boolean
    /** undefined = não mostra o botão de favoritar. */
    favorita?: boolean
    aoAlternarFavorita?: () => Promise<void>
}) {
    const [abrirMotivos, setAbrirMotivos] = useState(detalhado)
    const dias = diasAteData(match.prazoEnvio)
    const para = `/candidato/oportunidades/${match.oportunidadeId}`

    return (
        <article className={CARTAO_COM_RESPIRO}>
            <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <SeloDeTrilha trilha={trilhaDoSelo(match.trilhaCodigo)} />
                        {match.area && <span className="text-apoio text-secundario">{match.area}</span>}
                        <SeloDaElegibilidade situacao={match.elegibilidade} />
                        {match.jaSeCandidatou && <SeloStatus status="enviada" rotulo="Você já se candidatou" />}
                    </div>
                    <h3 className="mt-3 font-display text-bloco text-titulo">{match.oportunidadeTitulo}</h3>
                    <p className="mt-1 text-apoio text-secundario">
                        Inscrições até {formatarData(match.prazoEnvio)}
                        {dias !== null && ` · ${textoDosDias(dias)}`}
                    </p>
                </div>
                <div className="text-right">
                    <p className="font-display text-tela text-acento">{match.compatibilidade}</p>
                    <p className="text-legenda text-secundario">compatibilidade</p>
                </div>
                {favorita !== undefined && aoAlternarFavorita && (
                    <BotaoFavorito favorita={favorita} titulo={match.oportunidadeTitulo} aoAlternar={aoAlternarFavorita} />
                )}
            </div>

            {abrirMotivos && match.motivos.length > 0 && (
                <div className="mt-4 border-t border-sutil pt-4">
                    <BarrasDoMatch motivos={match.motivos} />
                </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
                <CustomButton to={para} variant="aprovar" size="auto">
                    {match.jaSeCandidatou ? 'Ver oportunidade' : 'Ver detalhes e candidatar'}
                </CustomButton>
                {!detalhado && match.motivos.length > 0 && (
                    <button
                        type="button"
                        aria-expanded={abrirMotivos}
                        onClick={() => setAbrirMotivos((v) => !v)}
                        className={`rounded-card px-1 text-apoio text-acento hover:text-titulo ${TRANSICAO_COR} ${ANEL_FOCO}`}
                    >
                        {abrirMotivos ? 'Esconder o porquê' : 'Por que esta nota?'}
                    </button>
                )}
            </div>
        </article>
    )
}

export default CartaoDeOportunidade
