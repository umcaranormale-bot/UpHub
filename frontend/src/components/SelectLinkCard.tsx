
import { useEffect, useRef, useState } from 'react';
import { CustomButton } from './CustomButton';
import type { Vinculo, Papel } from '../api/vinculos';

interface SelectLinkCardProps {
    vinculos: Vinculo[];
    onContinue: (vinculo: Vinculo) => void;
    onOutraConta: () => void;
}

const nomePapel: Record<Papel, string> = {
    PROVEDOR: 'Provedor',
    CANDIDATO: 'Candidato',
    AVALIADOR: 'Avaliador',
    MENTOR: 'Mentor',
    GESTAO: 'Gestão',
};

export default function SelectLinkCard({
    vinculos,
    onContinue,
    onOutraConta,
}: SelectLinkCardProps) {
    const vinculosAtivos = vinculos.filter(
        (vinculo) => vinculo.encerradoEm === null
    );

    const [selecionado, setSelecionado] = useState<number | null>(
        vinculosAtivos[0]?.id ?? null
    );

    const redirecionado = useRef(false);

    // Se existir apenas um vínculo ativo, seleciona automaticamente.
    useEffect(() => {
        if (vinculosAtivos.length === 1 && !redirecionado.current) {
            redirecionado.current = true;
            onContinue(vinculosAtivos[0]);
        }
    }, [vinculosAtivos, onContinue]);

    function handleContinue() {
        const vinculo = vinculosAtivos.find(
            (v) => v.id === selecionado
        );

        if (!vinculo) return;

        onContinue(vinculo);
    }

    return (
        <div className="w-full max-w-md rounded-xl border border-sutil bg-white p-6">
            <h2 className="text-sm font-bold text-titulo">
                Seu vínculo
            </h2>

            <p className="mt-2 text-xs leading-relaxed text-secundario">
                Você participa de mais de uma organização. Escolha com qual
                quer entrar. Depois poderá trocar pelo{" "}
                <strong>Trocar perfil</strong>, no cabeçalho, sem
                encerrar sessão.
            </p>

            <div className="mt-4 flex flex-col gap-2">
                {vinculosAtivos.map((vinculo) => {
                    const ativo = selecionado === vinculo.id;

                    return (
                        <button
                            key={vinculo.id}
                            type="button"
                            onClick={() => setSelecionado(vinculo.id)}
                            className={`w-full rounded-lg border p-3 text-left transition-colors ${
                                ativo
                                    ? 'border-acento bg-acento-suave'
                                    : 'border-sutil bg-white hover:border-acento'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                {/* Radio */}
                                <span
                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                        ativo
                                            ? 'border-acento'
                                            : 'border-gray-400'
                                    }`}
                                >
                                    {ativo && (
                                        <span className="h-2 w-2 rounded-full bg-acento" />
                                    )}
                                </span>

                                {/* Informações do vínculo */}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-titulo">
                                        {vinculo.organizacaoNome}
                                    </p>

                                    <p className="mt-1 text-xs text-secundario">
                                        Vínculo ativo
                                    </p>
                                </div>

                                {/* Papel */}
                                <span className="shrink-0 rounded-md bg-indigo-100 px-2 py-1 text-[10px] font-medium text-indigo-700">
                                    {nomePapel[vinculo.papel]}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {vinculosAtivos.length > 0 ? (
                <CustomButton
                    type="button"
                    variant="aprovar"
                    size="grande"
            className="mt-2 w-full"
                onClick={handleContinue}
            >
                Continuar
            </CustomButton>
        ) : (
            <p className="mt-4 text-center text-sm text-secundario">
                Nenhum vínculo ativo foi encontrado para sua conta.
            </p>
        )}

            <button
                type="button"
                onClick={onOutraConta}
                className="mt-3 w-full text-center text-xs font-medium text-acento transition-colors hover:text-indigo-700"
            >
                Entrar com outra conta
            </button>
        </div>
    );
}
