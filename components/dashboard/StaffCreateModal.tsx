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
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface StaffCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStaffCreated: () => void;
}

const createStaffSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  bio: z.string().optional(),
});

type CreateStaffFormData = z.infer<typeof createStaffSchema>;

export function StaffCreateModal({
  isOpen,
  onClose,
  onStaffCreated,
}: StaffCreateModalProps) {
  const form = useForm<CreateStaffFormData>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      bio: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: CreateStaffFormData) => {
    try {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          password: data.password,
          bio: data.bio || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear personal");
      }

      toast.success("Personal creado exitosamente");
      form.reset();
      onClose();
      onStaffCreated();
    } catch (error) {
      console.error("Error creating staff:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al crear personal",
      );
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Crear Nuevo Personal
          </DialogTitle>
          <DialogDescription>
            Completa los detalles para crear un nuevo miembro del personal
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
                field: ControllerRenderProps<CreateStaffFormData, "name">;
              }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <Input placeholder="ej. Juan Pérez" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({
                field,
              }: {
                field: ControllerRenderProps<CreateStaffFormData, "email">;
              }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <Input
                    type="email"
                    placeholder="juan@ejemplo.com"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({
                field,
              }: {
                field: ControllerRenderProps<CreateStaffFormData, "phone">;
              }) => (
                <FormItem>
                  <FormLabel>Teléfono (Opcional)</FormLabel>
                  <Input placeholder="555-0000" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({
                field,
              }: {
                field: ControllerRenderProps<CreateStaffFormData, "password">;
              }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <Input type="password" placeholder="••••••" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({
                field,
              }: {
                field: ControllerRenderProps<CreateStaffFormData, "bio">;
              }) => (
                <FormItem>
                  <FormLabel>Biografía (Opcional)</FormLabel>
                  <Input placeholder="Biografía profesional" {...field} />
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
                {isSubmitting ? "Creando..." : "Crear Personal"}
              </Button>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
