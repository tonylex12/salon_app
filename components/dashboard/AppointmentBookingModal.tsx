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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Validation schema
const appointmentSchema = z.object({
  clientId: z.string().min(1, "Selecciona un cliente"),
  serviceId: z.string().min(1, "Selecciona un servicio"),
  staffId: z.string().min(1, "Selecciona un personal"),
  date: z.string().min(1, "Selecciona una fecha"),
  time: z.string().min(1, "Selecciona una hora"),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Staff {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  bio: string | null;
  servicesCount: number;
  appointmentsCount: number;
  scheduleCount: number;
  createdAt: string;
}

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AppointmentBookingModal({
  isOpen,
  onClose,
  onSuccess,
}: AppointmentBookingModalProps) {
  const { data: session } = useSession();
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      clientId: session?.user?.id || "",
      serviceId: "",
      staffId: "",
      date: "",
      time: "",
      notes: "",
    },
  });

  // Set client ID if user is CLIENT
  useEffect(() => {
    if (session?.user?.role === "CLIENT" && session?.user?.id) {
      form.setValue("clientId", session.user.id);
    }
  }, [session, form]);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("/api/services?all=true");
        if (res.ok) {
          const data = await res.json();
          setServices(
            (data.services || []).map((s: Service) => ({
              ...s,
              price: s.price,
            })),
          );
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("Error al cargar servicios");
      }
    };

    if (isOpen) {
      fetchServices();
    }
  }, [isOpen]);

  // Fetch users (only for ADMIN/STAFF)
  useEffect(() => {
    const fetchUsers = async () => {
      if (session?.user?.role !== "ADMIN" && session?.user?.role !== "STAFF") {
        return;
      }

      try {
        const res = await fetch("/api/users?role=CLIENT");
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, session?.user?.role]);

  // Fetch staff
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch("/api/staff");
        if (res.ok) {
          const data = await res.json();
          setStaff(data.staff || []);
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    };

    if (isOpen) {
      fetchStaff();
    }
  }, [isOpen]);

  const onSubmit = async (data: AppointmentFormData) => {
    setIsSubmitting(true);

    try {
      if (!selectedService) {
        toast.error("Selecciona un servicio");
        setIsSubmitting(false);
        return;
      }

      // Combine date and time in local timezone
      const [year, month, day] = data.date.split("-").map(Number);
      const [hours, minutes] = data.time.split(":").map(Number);
      const appointmentDateTime = new Date(
        year,
        month - 1,
        day,
        hours,
        minutes,
      );
      const endDateTime = new Date(
        appointmentDateTime.getTime() + selectedService.duration * 60000,
      );

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: data.clientId,
          serviceId: data.serviceId,
          staffId: data.staffId,
          date: appointmentDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          notes: data.notes || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || "Error al agendar la cita");
        setIsSubmitting(false);
        return;
      }

      toast.success("Cita agendada exitosamente");
      form.reset();
      setSelectedService(null);
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Error inesperado al agendar la cita");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Agendar Nueva Cita
          </DialogTitle>
          <DialogDescription>
            Completa los detalles para agendar tu cita
          </DialogDescription>
        </DialogHeader>

        <Form {...form} onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Client Selection - Only for ADMIN/STAFF */}
            {session?.user?.role === "ADMIN" ||
            session?.user?.role === "STAFF" ? (
              <FormField
                control={form.control}
                name="clientId"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<AppointmentFormData, "clientId">;
                }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Cliente</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormItem>
                <FormLabel className="font-medium">Cliente</FormLabel>
                <div className="px-3 py-2 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                  {session?.user?.name}
                </div>
              </FormItem>
            )}

            {/* Service Selection */}
            <FormField
              control={form.control}
              name="serviceId"
              render={({
                field,
              }: {
                field: ControllerRenderProps<AppointmentFormData, "serviceId">;
              }) => (
                <FormItem>
                  <FormLabel className="font-medium">Servicio</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      const svc = services.find((s) => s.id === value);
                      setSelectedService(svc || null);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un servicio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} ({service.duration} min) - $
                          {service.price.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Staff Selection */}
            <FormField
              control={form.control}
              name="staffId"
              render={({
                field,
              }: {
                field: ControllerRenderProps<AppointmentFormData, "staffId">;
              }) => (
                <FormItem>
                  <FormLabel className="font-medium">Personal</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona personal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({
                field,
              }: {
                field: ControllerRenderProps<AppointmentFormData, "date">;
              }) => (
                <FormItem>
                  <FormLabel className="font-medium">Fecha</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      min={new Date().toISOString().split("T")[0]}
                      className="border-slate-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time */}
            <FormField
              control={form.control}
              name="time"
              render={({
                field,
              }: {
                field: ControllerRenderProps<AppointmentFormData, "time">;
              }) => (
                <FormItem>
                  <FormLabel className="font-medium">Hora</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      className="border-slate-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({
                field,
              }: {
                field: ControllerRenderProps<AppointmentFormData, "notes">;
              }) => (
                <FormItem>
                  <FormLabel className="font-medium">
                    Notas (opcional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Agrega notas o comentarios..."
                      {...field}
                      className="border-slate-200"
                    />
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
                {isSubmitting ? "Agendando..." : "Agendar Cita"}
              </Button>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
