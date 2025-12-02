"use client";

import { BarChart, BotMessageSquare,Compass, Layout, List } from "lucide-react";
import { usePathname } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";

import { SidebarItem } from "./SidebarItem";

const userRoutes = [
    {
        icon: Layout,
        label: 'Dashboard',
        href: '/dashboard',
    },
    {
        icon: Compass,
        label: 'Kursus Saya',
        href: '/my-courses',
    },
    {
        icon: BotMessageSquare,
        label: 'Chatbot',
        href: '/chatbot',
    },
];

const adminRoutes = [
    {
        icon: List,
        label: 'User',
        href: '/admin/user',
    },
    {
        icon: BarChart,
        label: 'Course',
        href: '/admin/course',
    },
];

const SidebarRoutes = () => {
    const pathname = usePathname();
    const { isAdmin } = useAuth();

    const isAdminPage = pathname?.includes('/admin');
    const routes = isAdmin && isAdminPage ? adminRoutes : userRoutes;

    return (
        <div className='flex flex-col w-full'>
            {routes.map((route) => {
                return (
                    <SidebarItem
                        key={route.href}
                        icon={route.icon}
                        label={route.label}
                        href={route.href}
                    />
                );
            })}
        </div>
    );
};

export default SidebarRoutes;
