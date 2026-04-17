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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
}

interface ServiceEditModalProps {
  isOpen: boolean;
  service: Service | null;
  onClose: () => void;
  onServiceUpdated: () => void;
}

const editServiceSchema = z.object({
  name: z.string().min(1, "El nombre del servicio es requerido"),
  description: z.string().optional(),
  duration: z.string().min(1, "La duración es requerida"),
  price: z.string().min(1, "El precio es requerido"),
});

type EditServiceFormData = z.infer<typeof editServiceSchema>;

export function ServiceEditModal({
  isOpen,
  service,
  onClose,
  onServiceUpdated,
}: ServiceEditModalProps) {
  const form = useForm<EditServiceFormData>({
    resolver: zodResolver(editServiceSchema),
    defaultValues: {
      name: service?.name || "",
      description: service?.description || "",
      duration: service?.duration?.toString() || "",
      price: service?.price?.toString() || "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: EditServiceFormData) => {
    if (!service) return;

    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description || null,
          duration: parseInt(data.duration),
          price: parseFloat(data.price),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar servicio");
      }

      toast.success("Servicio actualizado exitosamente");
      onClose();
      onServiceUpdated();
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar servicio",
      );
    }
  };

  if (!isOpen || !service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Editar Servicio
          </DialogTitle>
          <DialogDescription>
            Actualiza los detalles del servicio
          </DialogDescription>
        </DialogHeader>

        <Form {...form} onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({
                field,
              }: {
                field: ControllerRenderProps<EditServiceFormData, "name">;
              }) => (
                <FormItem>
                  <FormLabel>Nombre del Servicio</FormLabel>
                  <Input placeholder="ej. Corte de Cabello" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({
                field,
              }: {
                field: ControllerRenderProps<
                  EditServiceFormData,
                  "description"
                >;
              }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <Input placeholder="Descripción del servicio" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({
                field,
              }: {
                field: ControllerRenderProps<EditServiceFormData, "duration">;
              }) => (
                <FormItem>
                  <FormLabel>Duración (minutos)</FormLabel>
                  <Input type="number" placeholder="30" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({
                field,
              }: {
                field: ControllerRenderProps<EditServiceFormData, "price">;
              }) => (
                <FormItem>
                  <FormLabel>Precio ($)</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="29.99"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Actualizando..." : "Actualizar Servicio"}
              </Button>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
