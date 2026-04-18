"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface ReportData {
  success: boolean;
  period: string;
  startDate: string;
  endDate: string;
  summary: {
    totalAppointments: number;
    totalRevenue: number;
    completedCount: number;
    averageRevenue: number;
  };
  staffStats: Array<{
    name: string;
    appointments: number;
    revenue: number;
  }>;
  serviceStats: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  dailyStats: Array<{
    date: string;
    appointments: number;
    revenue: number;
  }>;
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [period, setPeriod] = useState<"day" | "week" | "month">("month");
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `/api/reports?period=${period}&date=${selectedDate}`,
      );
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      } else {
        toast.error("Error al cargar los reportes");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Error al cargar los reportes");
    } finally {
      setIsLoading(false);
    }
  }, [period, selectedDate]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session) {
      // Only ADMIN and STAFF can access reports
      if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
        router.push("/dashboard");
      }
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status === "authenticated" && session) {
      if (session.user.role === "ADMIN" || session.user.role === "STAFF") {
        // eslint-disable-next-line
        fetchReports();
      }
    }
  }, [session, status, fetchReports]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPeriodLabel = () => {
    if (period === "day") {
      return `Día: ${formatDate(selectedDate)}`;
    } else if (period === "week") {
      const date = new Date(selectedDate);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(date.setDate(diff));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `Semana: ${weekStart.toLocaleDateString("es-ES", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("es-ES", { month: "short", day: "numeric" })}`;
    } else {
      const date = new Date(selectedDate);
      return `Mes: ${date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}`;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-white to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-bold text-slate-900 font-serif">
            Reportes
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-2">
            Análisis de citas, ingresos y desempeño
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">
        {/* Filters */}
        <Card className="bg-white border-slate-200 mb-6 md:mb-8 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-4">
            Filtros
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-slate-700 mb-2">
                Período
              </label>
              <div className="flex gap-1 md:gap-2">
                {(["day", "week", "month"] as const).map((p) => (
                  <Button
                    key={p}
                    variant={period === p ? "default" : "outline"}
                    onClick={() => setPeriod(p)}
                    className="flex-1 capitalize text-xs md:text-sm"
                  >
                    {p === "day" ? "Día" : p === "week" ? "Semana" : "Mes"}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-slate-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 md:px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-xs md:text-sm"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={fetchReports}
                className="w-full text-xs md:text-sm"
              >
                Actualizar Reportes
              </Button>
            </div>
          </div>
        </Card>

        {/* Summary Stats */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-white border-slate-200 p-6 h-32" />
            ))}
          </div>
        ) : reportData ? (
          <>
            <div className="mb-4">
              <p className="text-xs md:text-sm font-medium text-slate-600">
                {getPeriodLabel()}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
              {/* Total Appointments */}
              <Card className="bg-white border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Total de Citas
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      {reportData.summary.totalAppointments}
                    </p>
                  </div>
                  <div className="text-4xl">📅</div>
                </div>
              </Card>

              {/* Total Revenue */}
              <Card className="bg-white border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Ingresos Totales
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      ${reportData.summary.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-4xl">💵</div>
                </div>
              </Card>

              {/* Completed Appointments */}
              <Card className="bg-white border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Completadas
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      {reportData.summary.completedCount}
                    </p>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </Card>

              {/* Average Revenue */}
              <Card className="bg-white border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Promedio por Cita
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      ${reportData.summary.averageRevenue.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-4xl">📊</div>
                </div>
              </Card>
            </div>

            {/* Staff Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
              <Card className="bg-white border-slate-200 p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  Estilistas más Solicitadas
                </h3>
                <div className="space-y-3">
                  {reportData.staffStats.length === 0 ? (
                    <p className="text-slate-600">Sin datos</p>
                  ) : (
                    reportData.staffStats.map((staff, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {staff.name}
                          </p>
                          <p className="text-sm text-slate-600">
                            {staff.appointments} citas
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">
                            ${staff.revenue.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Service Stats */}
              <Card className="bg-white border-slate-200 p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  Servicios más Populares
                </h3>
                <div className="space-y-3">
                  {reportData.serviceStats.length === 0 ? (
                    <p className="text-slate-600">Sin datos</p>
                  ) : (
                    reportData.serviceStats.map((service, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {service.name}
                          </p>
                          <p className="text-sm text-slate-600">
                            {service.count} reservas
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">
                            ${service.revenue.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Daily Stats */}
            {period !== "day" && (
              <Card className="bg-white border-slate-200 p-4 md:p-6">
                <h3 className="text-base md:text-xl font-semibold text-slate-900 mb-4">
                  Desempeño Diario
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs md:text-base">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-900">
                          Fecha
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-900">
                          Citas
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-900">
                          Ingresos
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.dailyStats.map((daily, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="py-3 px-4 text-slate-900">
                            {formatDate(daily.date)}
                          </td>
                          <td className="text-center py-3 px-4 text-slate-900">
                            {daily.appointments}
                          </td>
                          <td className="text-right py-3 px-4 text-slate-900 font-semibold">
                            ${daily.revenue.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
