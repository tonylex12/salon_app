"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface ClientEditModalProps {
  client: Client;
  onClose: () => void;
  onSuccess: () => void;
}

const clientSchema = z.object({
  phone: z.string().min(1, "El teléfono es requerido"),
});

type ClientFormData = z.infer<typeof clientSchema>;

export function ClientEditModal({
  client,
  onClose,
  onSuccess,
}: ClientEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      phone: client.phone || "",
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: data.phone }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || "Error al actualizar el cliente");
        setIsSubmitting(false);
        return;
      }

      toast.success("Cliente actualizado exitosamente");
      onClose();
      onSuccess();
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Error inesperado al actualizar el cliente");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Editar Cliente
          </DialogTitle>
          <DialogDescription>
            Actualiza la información del cliente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Display client info (read-only) */}
          <div>
            <FormLabel className="font-medium">Nombre</FormLabel>
            <div className="px-3 py-2 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
              {client.name}
            </div>
          </div>

          <div>
            <FormLabel className="font-medium">Email</FormLabel>
            <div className="px-3 py-2 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
              {client.email}
            </div>
          </div>

          {/* Phone - Editable */}
          <Form {...form} onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="phone"
              render={({
                field,
              }: {
                field: ControllerRenderProps<ClientFormData, "phone">;
              }) => (
                <FormItem>
                  <FormLabel className="font-medium">Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
