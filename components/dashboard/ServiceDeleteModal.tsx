"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  appointmentCount?: number;
}

interface ServiceDeleteModalProps {
  isOpen: boolean;
  service: Service | null;
  onClose: () => void;
  onServiceDeleted: () => void;
}

export function ServiceDeleteModal({
  isOpen,
  service,
  onClose,
  onServiceDeleted,
}: ServiceDeleteModalProps) {
  const isDeleting = false;

  const handleDelete = async () => {
    if (!service) return;

    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar servicio");
      }

      toast.success("Servicio eliminado exitosamente");
      onClose();
      onServiceDeleted();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar servicio",
      );
    }
  };

  if (!isOpen || !service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-600">
            ¿Eliminar Servicio?
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar <strong>{service.name}</strong>
            ?
          </DialogDescription>
        </DialogHeader>

        {service.appointmentCount && service.appointmentCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 my-4">
            <p className="text-sm text-red-700">
              ⚠️ Este servicio tiene {service.appointmentCount} cita
              {service.appointmentCount !== 1 ? "s" : ""} asociada
              {service.appointmentCount !== 1 ? "s" : ""}. Por favor revisa
              antes de eliminar.
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1"
          >
            {isDeleting ? "Eliminando..." : "Eliminar Servicio"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
