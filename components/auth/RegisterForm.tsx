"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
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
import { useState } from "react";
import { ControllerRenderProps, useForm } from "react-hook-form";

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  async function onSubmit(data: SignUpType) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Error al registrarse");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setError("Error al registrarse");
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

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
              ✓ Registro exitoso. Redirigiendo...
            </div>
          )}

          <Form
            {...form}
            onSubmit={form.handleSubmit(onSubmit)}
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
                      placeholder="Mínimo 6 caracteres"
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
              disabled={isLoading || success}
              className="w-full h-11 mt-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
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
          </Form>

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
