import type { ButtonHTMLAttributes } from 'react'

/**
 * Exemplo de componente, para servir de padrão.
 *
 * Componente é o que se repete em várias telas: botão, campo de
 * formulário, cabeçalho, card. Fica em src/components.
 * Tela inteira é outra coisa, e fica em src/pages.
 *
 * Uso:
 *   import Botao from '../components/Botao'
 *   <Botao>Entrar</Botao>
 *   <Botao variante="contorno" type="button">Cancelar</Botao>
 *
 * Podem alterar, renomear ou apagar este arquivo à vontade.
 */
type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variante?: 'solido' | 'contorno'
}

function Botao({ variante = 'solido', className = '', ...resto }: Props) {
    const base =
        'rounded-card px-4 py-2.5 text-corpo font-semibold transition disabled:opacity-60'

    const cor =
        variante === 'solido'
            ? 'bg-acento text-card hover:opacity-90'
            : 'border border-sutil bg-card text-titulo hover:border-acento'

    return <button className={`${base} ${cor} ${className}`} {...resto} />
}

export default Botao
