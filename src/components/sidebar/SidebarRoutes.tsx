"use client";

import { BarChart, Compass, Layout, List } from "lucide-react";
import { usePathname } from "next/navigation";

import { SidebarItem } from "./SidebarItem";

const guestRoutes = [
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
        icon: Compass,
        label: 'Cari',
        href: '/browse',
    },
];

const teacherRoutes = [
    {
        icon: List,
        label: 'Courses',
        href: '/teacher/courses',
    },
    {
        icon: BarChart,
        label: 'Analytics',
        href: '/teacher/analytics',
    },
];

const SidebarRoutes = () => {
    const pathname = usePathname();

    const isTeacher = pathname?.includes('/teacher');
    const routes = isTeacher ? teacherRoutes : guestRoutes;

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
