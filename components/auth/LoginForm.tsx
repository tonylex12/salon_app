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
import { toast } from "sonner";

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Mapear errores a mensajes explícitos
  const getErrorMessage = (error: string) => {
    const errorMap: Record<string, string> = {
      CredentialsSignin:
        "Email o contraseña incorrectos. Por favor verifica tus datos.",
      InvalidEmail: "El email no es válido.",
      UserNotFound: "No existe una cuenta con este email.",
      PasswordIncorrect: "La contraseña es incorrecta.",
      AccessDenied: "Acceso denegado. Por favor contacta con soporte.",
      Callback: "Error en la autenticación. Por favor intenta de nuevo.",
      OAuthSignin: "Error al conectar con el proveedor de OAuth.",
      OAuthCallback: "Error en la autenticación OAuth.",
      EmailSignInError: "No se pudo enviar el email de verificación.",
      SessionCallback: "Error en la sesión. Por favor inicia sesión de nuevo.",
      VerifyEmailError: "No se pudo verificar el email.",
      Default: "Error al iniciar sesión. Por favor intenta de nuevo.",
    };
    return errorMap[error] || errorMap.Default;
  };

  async function onSubmit(data: SignInType) {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      // Verificar si fue exitoso
      if (!result) {
        toast.error("Error desconocido", {
          description:
            "No se recibió respuesta del servidor. Por favor intenta de nuevo.",
        });
        setIsLoading(false);
        return;
      }

      if (result.error) {
        const errorMessage = getErrorMessage(result.error);
        toast.error("Error al iniciar sesión", {
          description: errorMessage,
        });
        setIsLoading(false);
        return;
      }

      // Si ok es true o si no hay error, fue exitoso
      if (result.ok) {
        toast.success("¡Bienvenido!", {
          description: "Iniciando sesión...",
        });
        // Esperar un momento antes de redirigir
        await new Promise((resolve) => setTimeout(resolve, 500));
        router.push("/dashboard");
        return;
      }

      toast.error("Error al iniciar sesión", {
        description: "Por favor intenta de nuevo.",
      });
      setIsLoading(false);
    } catch {
      toast.error("Error al iniciar sesión", {
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
              Bienvenido
            </h1>
            <p className="text-slate-600">Inicia sesión en tu cuenta</p>
          </div>

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
              className="w-full h-11 mt-6 bg-primary hover:bg-primary/80 text-white font-semibold rounded-lg transition-all duration-200"
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
