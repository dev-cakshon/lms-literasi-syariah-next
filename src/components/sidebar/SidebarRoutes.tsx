"use client";

import { BarChart, Compass, Layout, List, BotMessageSquare } from "lucide-react";
import { usePathname } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";

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
        icon: BotMessageSquare,
        label: 'Chatbot',
        href: '/chatbot',
    },
    // {
    //     icon: BotMessageSquare,
    //     label: 'Browse',
    //     href: '/browse',
    // },
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
    const { isInstructor } = useAuth();

    const isTeacherPage = pathname?.includes('/teacher');
    const routes = isTeacherPage ? teacherRoutes : guestRoutes;

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
            
            {/* Show teacher mode toggle for instructors */}
            {isInstructor && !isTeacherPage && (
                <div className="border-t mt-4 pt-4">
                    <SidebarItem
                        icon={List}
                        label="Mode Instruktur"
                        href="/teacher/courses"
                    />
                </div>
            )}
        </div>
    );
};

export default SidebarRoutes;
