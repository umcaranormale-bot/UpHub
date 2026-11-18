import AlertCard from "./AlertCard";

export default function CandidateAlerts() {
    return (
        <div className="space-y-2">
            <AlertCard
                title="Programa Acelera PE 2026 · o avaliador pediu 2 correções antes de decidir"
                status="Ajuste pedido"
                description="Revisar até 21/10 (faltam 5 dias)"
                button="Corrigir e reenviar"
            />

            <AlertCard
                title="Rodada Anjo Porto Digital 2026 · sua candidatura está em rascunho"
                status="Prazo mais próximo"
                description="Encerra em 3 dias"
                button="Continuar candidatura"
            />
        </div>
    );
}
