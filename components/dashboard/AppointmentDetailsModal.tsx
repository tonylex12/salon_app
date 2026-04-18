"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  staffName: string;
  serviceName: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: string;
}

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointment,
}: AppointmentDetailsModalProps) {
  if (!appointment) return null;

  // Parse the date
  const dateObj = new Date(appointment.date);
  const formattedDate = dateObj.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const statusColor =
    {
      CONFIRMED: "bg-green-100 text-green-800",
      PENDING: "bg-blue-100 text-blue-800",
      CANCELLED: "bg-red-100 text-red-800",
    }[appointment.status] || "bg-slate-100 text-slate-800";

  const statusLabel =
    {
      CONFIRMED: "Confirmada",
      PENDING: "Pendiente",
      CANCELLED: "Cancelada",
    }[appointment.status] || appointment.status;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalles de la Reserva</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Estado:</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
            >
              {statusLabel}
            </span>
          </div>

          {/* Service */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="font-semibold text-slate-900 mb-2">Servicio</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Nombre:</span>
                <span className="font-medium text-slate-900">
                  {appointment.serviceName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Duración:</span>
                <span className="font-medium text-slate-900">
                  {appointment.duration} min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Precio:</span>
                <span className="font-medium text-slate-900">
                  ${appointment.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="font-semibold text-slate-900 mb-2">Fecha y Hora</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Fecha:</span>
                <span className="font-medium text-slate-900 capitalize">
                  {formattedDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Hora:</span>
                <span className="font-medium text-slate-900">
                  {appointment.time}
                </span>
              </div>
            </div>
          </div>

          {/* Staff */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="font-semibold text-slate-900 mb-2">Personal</h3>
            <span className="font-medium text-slate-900">
              {appointment.staffName}
            </span>
          </div>

          {/* Client */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="font-semibold text-slate-900 mb-2">Cliente</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Nombre:</span>
                <span className="font-medium text-slate-900">
                  {appointment.clientName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Teléfono:</span>
                <span className="font-medium text-slate-900">
                  {appointment.clientPhone}
                </span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex gap-2 mt-6">
            <Button onClick={onClose} className="flex-1">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
