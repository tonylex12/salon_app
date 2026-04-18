"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  const getWelcomeMessage = () => {
    const role = session?.user?.role;
    if (role === "ADMIN") {
      return "Gestiona tu negocio de forma eficiente";
    } else if (role === "STAFF") {
      return "Gestiona tus citas y horarios";
    } else {
      return "Consulta y reserva tus citas";
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen md:h-screen bg-slate-100">
      <Sidebar />
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-900 truncate">
              Bienvenido, {session?.user?.name}
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-0.5">
              {getWelcomeMessage()}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-6 ml-4">
            <div className="hidden md:flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  {session?.user?.role === "ADMIN"
                    ? "Administrador"
                    : "Personal"}
                </p>
                <p className="text-xs text-slate-500">{session?.user?.email}</p>
              </div>
              <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold shrink-0">
                {session?.user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="md:hidden w-8 h-8 bg-linear-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {session?.user?.name?.charAt(0).toUpperCase()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs md:text-sm"
            >
              Cerrar
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-linear-to-br from-white to-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
