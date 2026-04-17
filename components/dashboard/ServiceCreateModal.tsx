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

interface ServiceCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceCreated: () => void;
}

const createServiceSchema = z.object({
  name: z.string().min(1, "El nombre del servicio es requerido"),
  description: z.string().optional(),
  duration: z.string().min(1, "La duración es requerida"),
  price: z.string().min(1, "El precio es requerido"),
});

type CreateServiceFormData = z.infer<typeof createServiceSchema>;

export function ServiceCreateModal({
  isOpen,
  onClose,
  onServiceCreated,
}: ServiceCreateModalProps) {
  const form = useForm<CreateServiceFormData>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: "",
      description: "",
      duration: "",
      price: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: CreateServiceFormData) => {
    try {
      const response = await fetch("/api/services", {
        method: "POST",
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
        throw new Error(error.error || "Error al crear servicio");
      }

      toast.success("Servicio creado exitosamente");
      form.reset();
      onClose();
      onServiceCreated();
    } catch (error) {
      console.error("Error creating service:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al crear servicio",
      );
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Crear Nuevo Servicio
          </DialogTitle>
          <DialogDescription>
            Completa los detalles para crear un nuevo servicio
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
                field: ControllerRenderProps<CreateServiceFormData, "name">;
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
                  CreateServiceFormData,
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
                field: ControllerRenderProps<CreateServiceFormData, "duration">;
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
                field: ControllerRenderProps<CreateServiceFormData, "price">;
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
                {isSubmitting ? "Creando..." : "Crear Servicio"}
              </Button>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
