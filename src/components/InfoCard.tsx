
import { LucideIcon } from "lucide-react"

import { IconBadge } from "./course-list/IconBadge"

interface InfoCardProps {
    icon: LucideIcon;
    label: string;
    numberOfItems: number;
    variant?: "default" | "success";
}

export const InfoCard = ({ icon: Icon, label, numberOfItems, variant }: InfoCardProps) => {
    return(
        <div className="border rounded-md flex items-center gap-x-2 p-3">
            <IconBadge icon={Icon} variant={variant} />
            <div className="">
        <p className="font-medium ">
            {label}
        </p>
        <p className="text-gray-500 text-sm">
            {numberOfItems} {numberOfItems === 1? "Kursus" : "Kursus"}
        </p>
            </div>
        </div>
    )
}