interface AlertCardProps {
    title: string;
    description: string;
    button: string;
}

export default function AlertCard({
    title,
    description,
    button,
}: AlertCardProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md border border-orange-200 bg-orange-50 p-3">
            <div>
                <p className="text-[10px] font-semibold text-orange-800">
                    Prazo / Ajuste pedido
                </p>

                <h3 className="text-xs font-bold text-orange-950">
                    {title}
                </h3>

                <p className="text-[10px] text-orange-900">
                    {description}
                </p>
            </div>

            <button className="shrink-0 rounded-md border border-orange-200 bg-white px-3 py-2 text-[10px] font-medium text-orange-800 hover:bg-orange-100">
                {button}
            </button>
        </div>
    );
}  