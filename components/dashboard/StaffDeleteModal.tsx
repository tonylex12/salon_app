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

interface Staff {
  id: string;
  name: string;
  appointmentsCount?: number;
}

interface StaffDeleteModalProps {
  isOpen: boolean;
  staff: Staff | null;
  onClose: () => void;
  onStaffDeleted: () => void;
}

export function StaffDeleteModal({
  isOpen,
  staff,
  onClose,
  onStaffDeleted,
}: StaffDeleteModalProps) {
  const isDeleting = false;

  const handleDelete = async () => {
    if (!staff) return;

    try {
      const response = await fetch(`/api/staff/${staff.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar personal");
      }

      toast.success("Personal eliminado exitosamente");
      onClose();
      onStaffDeleted();
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar personal",
      );
    }
  };

  if (!isOpen || !staff) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-600">
            ¿Eliminar Miembro del Personal?
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar a <strong>{staff.name}</strong>
            ?
          </DialogDescription>
        </DialogHeader>

        {staff.appointmentsCount && staff.appointmentsCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 my-4">
            <p className="text-sm text-red-700">
              ⚠️ Este miembro del personal tiene {staff.appointmentsCount} cita
              {staff.appointmentsCount !== 1 ? "s" : ""} asociada
              {staff.appointmentsCount !== 1 ? "s" : ""}. Por favor revisa antes
              de eliminar.
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
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
