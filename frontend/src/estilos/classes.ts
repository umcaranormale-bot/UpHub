/**
 * Classes que se repetiam em quase toda tela. Ficam aqui para que o anel de
 * foco e as transições sejam os mesmos em todo lugar, e para que mudar um
 * deles não vire caça ao texto repetido.
 *
 * As durações saem das variáveis de --dur-* do index.css, que zeram quando a
 * pessoa pede menos movimento no sistema operacional.
 */

export const ANEL_FOCO =
    'focus-visible:shadow-foco focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento'

/** Cor em 140ms: hover de link, de item de menu, de linha de tabela. */
export const TRANSICAO_COR =
    'transition-colors duration-[var(--dur-rapida)] ease-padrao'

/** Elevação e deslocamento em 200ms: cartão que sobe no hover. */
export const TRANSICAO_ELEVACAO =
    'transition-[box-shadow,border-color,transform] duration-[var(--dur-padrao)] ease-padrao'

/** O cartão branco padrão das telas. */
export const CARTAO = 'rounded-bloco border border-sutil bg-card shadow-card'

/** O mesmo cartão, já com o respiro interno. */
export const CARTAO_COM_RESPIRO = `${CARTAO} p-card`

/** Cartão que reage ao mouse, usado nas listas. */
export const CARTAO_INTERATIVO = `${CARTAO_COM_RESPIRO} ${TRANSICAO_ELEVACAO} hover:-translate-y-px hover:shadow-card-hover`
