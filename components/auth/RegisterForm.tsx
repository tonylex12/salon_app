"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SignUpSchema, type SignUp as SignUpType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  useEffect(() => {
    // Setup effect if needed
  }, [form]);

  // Mapear errores de registro a mensajes explícitos
  const getErrorMessage = (error: string) => {
    const errorMap: Record<string, string> = {
      already_exists: "Este email ya está registrado en el sistema.",
      invalid_email: "El email no es válido.",
      weak_password:
        "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, números y caracteres especiales.",
      registration_failed:
        "No se pudo completar el registro. Por favor intenta de nuevo.",
      server_error:
        "Error en el servidor. Por favor intenta de nuevo más tarde.",
    };
    return (
      errorMap[error] || "Error al registrarse. Por favor intenta de nuevo."
    );
  };

  async function onSubmit(data: SignUpType) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = getErrorMessage(
          result.error || "registration_failed",
        );
        toast.error("Error al registrarse", {
          description: errorMessage,
        });
        setIsLoading(false);
        return;
      }

      toast.success("¡Bienvenido!", {
        description: "Tu cuenta ha sido creada exitosamente. Redirigiendo...",
      });

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al registrarse", {
        description: "Hubo un error inesperado. Por favor intenta de nuevo.",
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md shadow-lg border border-slate-200">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-serif font-bold text-slate-900">
              Crear Cuenta
            </h1>
            <p className="text-slate-600">Úntete y comienza a reservar</p>
          </div>

          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              // Mostrar errores de validación con toast
              Object.entries(errors).forEach(([field, error]) => {
                if (error?.message) {
                  toast.error(`Error en ${field}`, {
                    description: error.message as string,
                  });
                }
              });
            })}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({
                field,
              }: {
                field: ControllerRenderProps<SignUpType, "name">;
              }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">
                    Nombre Completo
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Juan Pérez"
                      {...field}
                      className="border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                    />
                  </FormControl>
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
                field: ControllerRenderProps<SignUpType, "email">;
              }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="tu@email.com"
                      type="email"
                      {...field}
                      className="border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                    />
                  </FormControl>
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
                field: ControllerRenderProps<SignUpType, "password">;
              }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">
                    Contraseña
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Mín. 8 caracteres, mayúscula, número, carácter especial"
                      type="password"
                      {...field}
                      className="border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 mt-6 bg-primary hover:bg-primary/80 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Registrando...
                </span>
              ) : (
                "Crear Cuenta"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-500">
                ¿Ya tienes cuenta?
              </span>
            </div>
          </div>

          <Link href="/login">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-slate-200 text-slate-900 hover:bg-slate-50 font-medium transition-colors"
            >
              Inicia Sesión
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
