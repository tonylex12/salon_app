"use client";

import { AppointmentBookingModal } from "@/components/dashboard/AppointmentBookingModal";
import { DashboardKPIs } from "@/components/dashboard/DashboardKPIs";
import { PopularServices } from "@/components/dashboard/PopularServices";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";
import { Card } from "@/components/ui/card";
import {
  AppointmentSkeletonLoader,
  ServiceSkeletonLoader,
} from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Stats {
  pendingAppointments: number;
  newClients: number;
  revenueToday: number;
  revenueDiff: number;
  occupancyPercentage: number;
}

interface Appointment {
  id: string;
  serviceName: string;
  staffName: string;
  clientName: string;
  clientPhone: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: string;
  statusColor: string;
  notes: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  staffCount: number;
  appointmentCount: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch de datos
  useEffect(() => {
    if (status !== "authenticated" || !session) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const userRole = session.user?.role as "ADMIN" | "STAFF" | "CLIENT";

        // Fetch servicios (todos pueden ver)
        const servicesRes = await fetch("/api/services");
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          setServices(servicesData.services);
        }

        // Fetch appointments
        const appointmentsRes = await fetch("/api/appointments");
        if (appointmentsRes.ok) {
          const appointmentsData = await appointmentsRes.json();
          setAppointments(appointmentsData.appointments);
        }

        // Fetch admin/staff specific data
        if (userRole === "ADMIN" || userRole === "STAFF") {
          const statsRes = await fetch("/api/dashboard/stats");
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setStats(statsData);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Error al cargar datos del dashboard");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session, status]);

  const handleRefreshAppointments = async () => {
    try {
      const appointmentsRes = await fetch("/api/appointments");
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData.appointments);
      }
    } catch (error) {
      console.error("Error refreshing appointments:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-linear-to-br from-white to-slate-50 flex items-center justify-center">
        <div className="space-y-8 w-full max-w-4xl px-8">
          {/* Header Skeleton */}
          <div className="space-y-3 animate-pulse">
            <div className="h-10 w-64 bg-slate-200 rounded" />
            <div className="h-5 w-48 bg-slate-200 rounded" />
          </div>

          {/* KPIs Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded" />
            ))}
          </div>

          {/* Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-slate-200 rounded" />
            <div className="space-y-6">
              <div className="h-48 bg-slate-200 rounded" />
              <div className="h-48 bg-slate-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const userRole = session.user?.role as "ADMIN" | "STAFF" | "CLIENT";
  const isAdmin = userRole === "ADMIN";
  const isStaff = userRole === "STAFF";
  const isClient = userRole === "CLIENT";

  return (
    <div className="min-h-screen bg-linear-to-br from-white to-slate-50">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 font-serif">
                {isClient ? "Mis Citas" : "Panel de Control"}
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
        {(isAdmin || isStaff) && (
          <>
            {/* KPI Grid - Solo ADMIN/STAFF */}
            {stats && (
              <DashboardKPIs
                pendingAppointments={stats.pendingAppointments}
                newClients={stats.newClients}
                revenueToday={stats.revenueToday}
                revenueDiff={stats.revenueDiff}
                occupancyPercentage={stats.occupancyPercentage}
                isLoading={isLoading}
              />
            )}

            {/* Content Grid - Fuera del KPI Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity - Wider */}
              <div className="lg:col-span-2">
                <RecentActivity isLoading={isLoading} />
              </div>

              {/* Services and Appointments */}
              <div className="space-y-6">
                <PopularServices />
                <UpcomingAppointments />
              </div>
            </div>
          </>
        )}

        {/* CLIENT VIEW */}
        {isClient && (
          <div className="space-y-6">
            {/* Próximas Citas */}
            <Card className="bg-white border-slate-200 overflow-hidden">
              <div className="border-b border-slate-200 px-6 py-4 bg-linear-to-r from-slate-50 to-white">
                <h2 className="text-lg font-semibold text-slate-900">
                  Próximas Citas
                </h2>
              </div>
              <div className="divide-y divide-slate-200">
                {isLoading ? (
                  <div className="p-6">
                    <AppointmentSkeletonLoader />
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="p-6 text-center">
                    <svg
                      className="w-12 h-12 text-slate-300 mx-auto mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <p className="text-slate-600 text-sm">
                      ¿Quieres agendar una nueva cita?
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="inline-block mt-3 px-6 py-2 bg-purple-600 text-white rounded-lg font-medium text-sm hover:bg-purple-700 transition-colors"
                    >
                      Agendar Cita
                    </button>
                  </div>
                ) : (
                  <>
                    {appointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-6 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900">
                              {apt.serviceName}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">
                              Estilista: {apt.staffName}
                            </p>
                            <div className="flex items-center gap-4 mt-3">
                              <p className="text-xs text-slate-500">
                                📅 {apt.date}
                              </p>
                              <p className="text-xs text-slate-500">
                                🕐 {apt.time}
                              </p>
                              <p className="text-xs text-slate-500">
                                ⏱️ {apt.duration} min
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                              {apt.status === "CONFIRMED"
                                ? "Confirmada"
                                : apt.status === "PENDING"
                                  ? "Pendiente"
                                  : apt.status}
                            </span>
                            <p className="text-sm font-semibold text-slate-900 mt-2">
                              ${apt.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Vacía - Agendar */}
                    <div className="p-6 text-center">
                      <svg
                        className="w-12 h-12 text-slate-300 mx-auto mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <p className="text-slate-600 text-sm">
                        ¿Quieres agendar una nueva cita?
                      </p>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-block mt-3 px-6 py-2 bg-purple-600 text-white rounded-lg font-medium text-sm hover:bg-purple-700 transition-colors"
                      >
                        Agendar Cita
                      </button>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Servicios Populares */}
            <Card className="bg-white border-slate-200 overflow-hidden">
              <div className="border-b border-slate-200 px-6 py-4 bg-linear-to-r from-slate-50 to-white">
                <h2 className="text-lg font-semibold text-slate-900">
                  Servicios Populares
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoading ? (
                  <div className="col-span-2">
                    <ServiceSkeletonLoader />
                  </div>
                ) : services.length === 0 ? (
                  <div className="col-span-2 text-center text-slate-500">
                    No hay servicios disponibles
                  </div>
                ) : (
                  services.map((service) => (
                    <div
                      key={service.id}
                      className="border border-slate-200 rounded-lg p-4"
                    >
                      <h3 className="font-medium text-slate-900">
                        {service.name}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {service.duration} min
                      </p>
                      <p className="text-lg font-semibold text-purple-600 mt-2">
                        ${service.price.toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Appointment Booking Modal */}
            <AppointmentBookingModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSuccess={() => {
                setIsModalOpen(false);
                handleRefreshAppointments();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
