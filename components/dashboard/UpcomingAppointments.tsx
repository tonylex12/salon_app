"use client";

import { Card } from "@/components/ui/card";
import { AppointmentSkeletonLoader } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

interface Appointment {
  id: string;
  serviceName: string;
  staffName: string;
  date: string;
  time: string;
  status: string;
  notes: string;
}

export function UpcomingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const appointmentsRes = await fetch("/api/appointments");
        if (appointmentsRes.ok) {
          const appointmentsData = await appointmentsRes.json();
          setAppointments(appointmentsData.appointments || []);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Filtrar solo las citas pendientes/confirmadas (no completadas)
  const upcomingAppointments = appointments.filter(
    (apt) => apt.status !== "COMPLETED",
  );

  return (
    <Card className="bg-background border-border overflow-hidden">
      <div className="border-b border-border px-6 py-4 bg-linear-to-r from-muted/50 to-background">
        <h3 className="text-base font-semibold text-foreground">
          Próximas Citas
        </h3>
      </div>
      <div className="p-6 space-y-3">
        {isLoading ? (
          <AppointmentSkeletonLoader />
        ) : upcomingAppointments.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No hay citas próximas
          </div>
        ) : (
          upcomingAppointments.map((appointment, index) => (
            <div
              key={appointment.id}
              className={`flex items-start gap-3 pb-3 ${
                index !== upcomingAppointments.length - 1
                  ? "border-b border-border"
                  : ""
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-muted mt-1.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {appointment.time} - {appointment.staffName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {appointment.serviceName}
                </p>
                {appointment.notes && (
                  <p className="text-xs text-muted-foreground mt-1">
                    📝 {appointment.notes}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
