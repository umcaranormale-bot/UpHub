import { CustomButton } from "./CustomButton";

interface AlertCardProps {
    title: string;
    status: string;
    description: string;
    button: string;
}

export default function AlertCard({
    title,
    status,
    description,
    button,
}: AlertCardProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-md border border-orange-200 bg-orange-50 p-5">
            <div>
                <p className="text-legenda font-semibold text-alerta">
                    {status} ⋅ {description}
                </p>

                <h3 className="w-120 text-base font-bold text-alerta">
                    {title}
                </h3>

            </div>

            <CustomButton variant="laranja" size="auto">
                {button}
            </CustomButton>
        </div>
    );
}  