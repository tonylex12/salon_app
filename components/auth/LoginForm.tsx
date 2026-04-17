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
import { SignInSchema, type SignIn as SignInType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ControllerRenderProps, useForm } from "react-hook-form";

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SignInType) {
    console.log("📝 Form submitted with data:", data);
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔐 Calling signIn with credentials...");
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      console.log("✅ Login result:", result);
      console.log("📊 Result type:", typeof result);
      console.log("📊 Result keys:", result ? Object.keys(result) : "null");

      // Verificar si fue exitoso
      if (!result) {
        console.error("❌ No result returned");
        setError("Error desconocido al iniciar sesión");
        setIsLoading(false);
        return;
      }

      if (result.error) {
        console.error("❌ Error from signIn:", result.error);
        setError(result.error || "Error al iniciar sesión");
        setIsLoading(false);
        return;
      }

      // Si ok es true o si no hay error, fue exitoso
      if (result.ok) {
        console.log("✅ Login successful! Redirecting to dashboard...");
        // Esperar un momento antes de redirigir
        await new Promise((resolve) => setTimeout(resolve, 500));
        router.push("/dashboard");
        return;
      }

      console.warn("⚠️ Result OK is false:", result);
      setError("Error al iniciar sesión");
      setIsLoading(false);
    } catch (error) {
      console.error("❌ Login error:", error);
      setError("Error al iniciar sesión");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md shadow-lg border border-slate-200">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-serif font-bold text-slate-900">
              Bienvenido
            </h1>
            <p className="text-slate-600">Inicia sesión en tu cuenta</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Form
            {...form}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({
                field,
              }: {
                field: ControllerRenderProps<SignInType, "email">;
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
                field: ControllerRenderProps<SignInType, "password">;
              }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">
                    Contraseña
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
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
              className="w-full h-11 mt-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all duration-200"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Iniciando...
                </span>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-500">
                ¿No tienes cuenta?
              </span>
            </div>
          </div>

          <Link href="/registro">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-slate-200 text-slate-900 hover:bg-slate-50 font-medium transition-colors"
            >
              Crear Cuenta
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
