"use client"

import { IconType } from "react-icons"
import { FcBullish, FcBusinessman, FcCalculator, FcCurrencyExchange, FcMoneyTransfer, FcSalesPerformance } from "react-icons/fc"

import { CategoryItem } from "./CategoryItem"

interface CategoriesProps {
    items: { _id: string; name: string }[];
}

const iconMap: Record<{ name: string }["name"], IconType> = {
    "Fiqih Muamalah": FcBusinessman,
    "Investasi Syariah": FcBullish,
    "Keuangan Syariah": FcMoneyTransfer,
    "Akuntansi Syariah": FcCalculator,
    "Perbankan Syariah": FcCurrencyExchange,
    "Asuransi Syariah": FcSalesPerformance,
}

export const Categories = ({ items }: CategoriesProps) => {
    return (<div className="flex items-center gap-x-2 overflow-x-auto pb-2">
        {items.map((item, idx) => {
            return (
                <CategoryItem
                    key={idx}
                    label={item.name}
                    icon={iconMap[item.name]}
                    value={item._id}
                />
            )
        })}
    </div>)
}