
import { LucideIcon } from "lucide-react"

import { IconBadge } from "../IconBadge"

interface InfoCardProps {
    icon: LucideIcon;
    label: string;
    numberOfItems: number;
    variant?: "default" | "success";
}

export const InfoCard = ({ icon: Icon, label, numberOfItems, variant }: InfoCardProps) => {
    return(
        <div className="bg-white border rounded-md flex items-center gap-x-2 p-3">
            <IconBadge icon={Icon} variant={variant} />
            <div className="">
        <p className="font-medium ">
            {label}
        </p>
        <p className="text-gray-500 text-sm">
            {numberOfItems} Kursus
        </p>
            </div>
        </div>
    )
}