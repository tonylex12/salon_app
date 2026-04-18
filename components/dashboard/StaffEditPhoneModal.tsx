"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface StaffMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
}

interface StaffEditPhoneModalProps {
  staff: StaffMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function StaffEditPhoneModal({
  staff,
  isOpen,
  onClose,
  onSuccess,
}: StaffEditPhoneModalProps) {
  const [phone, setPhone] = useState(staff?.phone || "");
  const [isLoading, setIsLoading] = useState(false);

  // Update phone when staff changes
  useEffect(() => {
    if (staff && isOpen) {
      setTimeout(() => {
        setPhone(staff.phone);
      }, 0);
    }
  }, [staff, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!staff) return;

    if (!phone.trim()) {
      toast.error("El teléfono no puede estar vacío");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`/api/staff/${staff.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || "Error al actualizar teléfono");
        return;
      }

      toast.success("Teléfono actualizado exitosamente");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating phone:", error);
      toast.error("Error al actualizar teléfono");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !staff) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Teléfono</DialogTitle>
          <DialogDescription>
            Actualiza el número de teléfono de {staff.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nombre (no editable)
            </label>
            <input
              type="text"
              value={staff.name}
              disabled
              className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email (no editable)
            </label>
            <input
              type="email"
              value={staff.email}
              disabled
              className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Teléfono *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: +57 300 123 4567"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Actualizando..." : "Actualizar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
