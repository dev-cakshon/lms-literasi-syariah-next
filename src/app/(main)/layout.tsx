import * as React from "react";

import { NavbarMain } from "@/components/navbar/NavbarMain";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/sidebar/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="h-full">
        <div className="h-full hidden md:flex flex-col w-56 fixed inset-y-0 border-r z-50 ">
          <Sidebar />
        </div>
        <main className="h-full md:pl-56">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
