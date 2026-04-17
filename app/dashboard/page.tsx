"use client";

import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-linear-to-br from-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="mt-4 text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-white to-slate-50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 font-serif">
                Panel de Control
              </h1>
              <p className="text-slate-600 mt-2 text-lg">
                Bienvenido, {session.user?.name || "Usuario"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">
                {new Date().toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Citas Pendientes */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">
                  Citas Pendientes
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">12</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">+2 desde ayer</p>
          </div>

          {/* Clientes Nuevos */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">
                  Clientes Nuevos
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">5</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">Esta semana</p>
          </div>

          {/* Ingresos */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">
                  Ingresos Hoy
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">$450</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">+$120 vs ayer</p>
          </div>

          {/* Ocupación */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">
                  Ocupación
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">78%</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-4 bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-linear-to-r from-purple-500 to-purple-600 h-1.5 rounded-full"
                style={{ width: "78%" }}
              />
            </div>
          </div>
        </div>

        {/* Content Grid - Fuera del KPI Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity - Wider */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-slate-200 overflow-hidden">
              <div className="border-b border-slate-200 px-6 py-4 bg-linear-to-r from-slate-50 to-white">
                <h2 className="text-lg font-semibold text-slate-900">
                  Actividad Reciente
                </h2>
              </div>
              <div className="divide-y divide-slate-200">
                {/* Activity Item 1 */}
                <div className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        Cita confirmada: María García
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        Corte y peinado profesional
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        Hoy a las 14:00 · Estilista: Laura Martínez
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-green-600 shrink-0">
                      $85
                    </span>
                  </div>
                </div>

                {/* Activity Item 2 */}
                <div className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        Nuevo cliente registrado
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        Juan Pérez · Cliente Premium
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        Hace 2 horas
                      </p>
                    </div>
                  </div>
                </div>

                {/* Activity Item 3 */}
                <div className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        Cita cancelada: Carlos López
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        Manicura express
                      </p>
                      <p className="text-xs text-slate-500 mt-2">Hace 1 hora</p>
                    </div>
                    <span className="text-sm font-semibold text-red-600 shrink-0">
                      -$35
                    </span>
                  </div>
                </div>

                {/* Activity Item 4 */}
                <div className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        Pago pendiente procesado
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        Rosa Fernández · Peinado
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        Hace 30 minutos
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 shrink-0">
                      $65
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <DashboardStats />
        </div>
      </div>
    </div>
  );
}
