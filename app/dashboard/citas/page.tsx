"use client";

import { AppointmentBookingModal } from "@/components/dashboard/AppointmentBookingModal";
import { AppointmentCard } from "@/components/dashboard/AppointmentCard";
import { AppointmentSearch } from "@/components/dashboard/AppointmentSearch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentSkeletonLoader } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

export default function CitasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !session) return;

    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/appointments");
        if (res.ok) {
          const data = await res.json();
          setAppointments(data.appointments || []);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Error al cargar las citas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [session, status]);

  const filteredAppointments = appointments.filter((apt) => {
    // Filter by status
    let statusMatch = true;
    if (filter === "pending")
      statusMatch = apt.status !== "COMPLETED" && apt.status !== "CANCELLED";
    if (filter === "completed")
      statusMatch = apt.status === "COMPLETED" || apt.status === "CANCELLED";

    // Filter by search query (client name)
    const searchMatch = apt.clientName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return statusMatch && searchMatch;
  });

  const handleRefreshAppointments = async () => {
    try {
      const res = await fetch("/api/appointments");
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error("Error refreshing appointments:", error);
    }
  };

  const handleStatusChange = async (
    appointmentId: string,
    newStatus: string,
  ) => {
    const statusLabel =
      newStatus === "CONFIRMED"
        ? "Confirmada"
        : newStatus === "COMPLETED"
          ? "Completada"
          : newStatus;

    try {
      const res = await fetch("/api/appointments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Cita actualizada a ${statusLabel}`);
        handleRefreshAppointments();
      } else {
        toast.error("Error al actualizar la cita");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Error al actualizar la cita");
    }
  };

  const handleDeleteAppointment = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
    setCancelDialogOpen(true);
  };

  const confirmCancelAppointment = async () => {
    if (!appointmentToCancel) return;

    setIsCancelling(true);

    try {
      const res = await fetch("/api/appointments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: appointmentToCancel.id }),
      });

      if (res.ok) {
        toast.success("Cita cancelada exitosamente");
        handleRefreshAppointments();
        setCancelDialogOpen(false);
        setAppointmentToCancel(null);
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al cancelar la cita");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Error al cancelar la cita");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReschedule = (appointment: Appointment) => {
    // Abre el modal para que el usuario pueda agendar una nueva cita
    setIsModalOpen(true);
    toast.info(
      "Agenda una nueva cita. Después podrás cancelar la anterior si lo deseas.",
    );
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-linear-to-br from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="space-y-4 animate-pulse">
            <div className="h-10 w-48 bg-slate-200 rounded" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 bg-slate-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-white to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-bold text-slate-900 font-serif">
            Mis Citas
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-2">
            Visualiza todas tus citas agendadas
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">
        {/* Header with CTA */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
              Tus Citas
            </h2>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto"
          >
            Agendar Nueva Cita
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 md:mb-8">
          <AppointmentSearch onSearchChange={setSearchQuery} />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mb-6 md:mb-8">
          <Button
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "default" : "outline"}
            className="flex-1 sm:flex-none text-xs md:text-sm"
          >
            Todas ({appointments.length})
          </Button>
          <Button
            onClick={() => setFilter("pending")}
            variant={filter === "pending" ? "default" : "outline"}
            className="flex-1 sm:flex-none text-xs md:text-sm"
          >
            Próximas (
            {
              appointments.filter(
                (apt) =>
                  apt.status !== "COMPLETED" && apt.status !== "CANCELLED",
              ).length
            }
            )
          </Button>
          <Button
            onClick={() => setFilter("completed")}
            variant={filter === "completed" ? "default" : "outline"}
            className="flex-1 sm:flex-none text-xs md:text-sm"
          >
            Historial (
            {
              appointments.filter(
                (apt) =>
                  apt.status === "COMPLETED" || apt.status === "CANCELLED",
              ).length
            }
            )
          </Button>
        </div>

        {/* Citas List */}
        <div className="space-y-3 md:space-y-4">
          {isLoading ? (
            <Card className="bg-white border-slate-200 overflow-hidden">
              <div className="p-6">
                <AppointmentSkeletonLoader />
              </div>
            </Card>
          ) : filteredAppointments.length === 0 ? (
            <Card className="bg-white border-slate-200 overflow-hidden">
              <div className="p-8 md:p-12 text-center">
                <svg
                  className="w-12 md:w-16 h-12 md:h-16 text-slate-300 mx-auto mb-3 md:mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-slate-600 text-base md:text-lg">
                  {filter === "all"
                    ? "No tienes citas agendadas"
                    : filter === "pending"
                      ? "No tienes citas próximas"
                      : "No tienes historial de citas"}
                </p>
              </div>
            </Card>
          ) : (
            filteredAppointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                userRole={session?.user?.role as "ADMIN" | "STAFF" | "CLIENT"}
                onReschedule={handleReschedule}
                onStatusChange={handleStatusChange}
                onCancel={handleDeleteAppointment}
              />
            ))
          )}
        </div>
      </div>

      {/* Cancel Appointment Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Cita</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cancelar esta cita?{" "}
              {appointmentToCancel && `de ${appointmentToCancel.clientName}`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelDialogOpen(false);
                setAppointmentToCancel(null);
              }}
              disabled={isCancelling}
            >
              No, mantener cita
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancelAppointment}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelando..." : "Sí, cancelar cita"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appointment Booking Modal */}
      <AppointmentBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleRefreshAppointments}
      />
    </div>
  );
}
