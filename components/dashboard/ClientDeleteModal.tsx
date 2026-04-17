"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  email: string;
}

interface ClientDeleteModalProps {
  client: Client;
  onClose: () => void;
  onSuccess: () => void;
}

export function ClientDeleteModal({
  client,
  onClose,
  onSuccess,
}: ClientDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || "Error al eliminar el cliente");
        setIsDeleting(false);
        return;
      }

      toast.success("Cliente eliminado exitosamente");
      onClose();
      onSuccess();
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Error inesperado al eliminar el cliente");
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-600">
            Eliminar Cliente
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar este cliente?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Client Info */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-900 font-semibold">{client.name}</p>
            <p className="text-red-700 text-sm">{client.email}</p>
            <p className="text-red-600 text-sm mt-2 italic">
              ⚠️ Esta acción no se puede deshacer
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? "Eliminando..." : "Eliminar Cliente"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
