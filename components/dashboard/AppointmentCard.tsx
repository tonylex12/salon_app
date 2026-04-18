"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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

interface AppointmentCardProps {
  appointment: Appointment;
  userRole?: "ADMIN" | "STAFF" | "CLIENT";
  onReschedule?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
  onStatusChange?: (appointmentId: string, newStatus: string) => void;
}

const statusTranslations: Record<string, { label: string; color: string }> = {
  PENDING: {
    label: "Pendiente",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  CONFIRMED: {
    label: "Confirmada",
    color: "bg-green-50 text-green-700 border-green-200",
  },
  COMPLETED: {
    label: "Completada",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  CANCELLED: {
    label: "Cancelada",
    color: "bg-red-50 text-red-700 border-red-200",
  },
};

export function AppointmentCard({
  appointment,
  userRole,
  onReschedule,
  onCancel,
  onStatusChange,
}: AppointmentCardProps) {
  const getStatusStyle = (status: string) => {
    return statusTranslations[status] || statusTranslations.PENDING;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const statusInfo = getStatusStyle(appointment.status);

  return (
    <Card className="bg-white border-slate-200 hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              {appointment.serviceName}
            </h3>
            <div className="space-y-1 mt-2">
              <p className="text-sm text-slate-600">
                👤 Cliente:{" "}
                <span className="font-medium text-slate-900">
                  {appointment.clientName}
                </span>
              </p>
              <p className="text-sm text-slate-600">
                ✂️ Estilista:{" "}
                <span className="font-medium text-slate-900">
                  {appointment.staffName}
                </span>
              </p>
            </div>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Date */}
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-xs text-slate-600 font-medium mb-1">📅 Fecha</p>
            <p className="text-sm font-semibold text-slate-900">
              {formatDate(appointment.date)}
            </p>
          </div>

          {/* Time */}
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-xs text-slate-600 font-medium mb-1">🕐 Hora</p>
            <p className="text-sm font-semibold text-slate-900">
              {appointment.time}
            </p>
          </div>

          {/* Duration */}
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-xs text-slate-600 font-medium mb-1">
              ⏱️ Duración
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {appointment.duration} min
            </p>
          </div>

          {/* Price */}
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-xs text-slate-600 font-medium mb-1">💵 Precio</p>
            <p className="text-sm font-semibold text-slate-900">
              ${appointment.price.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Contact & Notes */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          {appointment.clientPhone && (
            <div className="flex items-center gap-3">
              <span className="text-slate-600">📞</span>
              <span className="text-sm text-slate-700">
                {appointment.clientPhone}
              </span>
            </div>
          )}

          {appointment.notes && (
            <div className="flex gap-3">
              <span className="text-slate-600">📝</span>
              <p className="text-sm text-slate-700 italic">
                {appointment.notes}
              </p>
            </div>
          )}

          {!appointment.clientPhone && !appointment.notes && (
            <p className="text-xs text-slate-400">Sin información adicional</p>
          )}
        </div>

        {/* Actions */}
        {userRole === "ADMIN" || userRole === "STAFF" ? (
          // Admin/Staff actions: Change status or delete (only if not completed)
          appointment.status !== "COMPLETED" &&
          appointment.status !== "CANCELLED" ? (
            <div className="mt-4 pt-4 border-t border-slate-200 flex gap-2">
              <div className="flex gap-2 flex-1">
                {appointment.status !== "CONFIRMED" && (
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={() =>
                      onStatusChange?.(appointment.id, "CONFIRMED")
                    }
                  >
                    Confirmar
                  </Button>
                )}
                {appointment.status === "CONFIRMED" && (
                  <Button
                    className="flex-1 bg-emerald-400 hover:bg-emerald-500"
                    onClick={() =>
                      onStatusChange?.(appointment.id, "COMPLETED")
                    }
                  >
                    Marcar como Completada
                  </Button>
                )}
              </div>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => onCancel?.(appointment)}
              >
                Eliminar Cita
              </Button>
            </div>
          ) : null
        ) : appointment.status === "PENDING" ||
          appointment.status === "CONFIRMED" ? (
          // Client actions: Reschedule or cancel
          <div className="mt-4 pt-4 border-t border-slate-200 flex gap-3">
            <Button
              className="flex-1"
              onClick={() => onReschedule?.(appointment)}
            >
              Reprogramar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => onCancel?.(appointment)}
            >
              Cancelar
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
