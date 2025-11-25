import { ReactNode } from 'react';

export default function TeacherLayout({ children }: { children: ReactNode }) {
    return (
        <div className="h-full">
            {children}
        </div>
    );
}
