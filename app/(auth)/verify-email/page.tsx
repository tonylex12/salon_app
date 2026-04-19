"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(!!token); // Si hay token, verificar automáticamente
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      // Verificar el token automáticamente
      const verifyToken = async () => {
        try {
          const response = await fetch(
            `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
          );

          if (response.ok) {
            toast.success("¡Email verificado exitosamente!");
            // Redirigir a login después de 2 segundos
            setTimeout(() => {
              router.push("/login");
            }, 2000);
          } else {
            const data = await response.json();
            setError(
              data.error || "No se pudo verificar el email. Intenta de nuevo.",
            );
            setIsLoading(false);
          }
        } catch (err) {
          console.error("Error verifying email:", err);
          setError("Error al verificar el email. Por favor intenta de nuevo.");
          setIsLoading(false);
        }
      };

      verifyToken();
    }
  }, [token, router]);

  const handleResendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResending(true);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success("Email de verificación enviado nuevamente");
        setEmail("");
        setShowResend(false);
      } else {
        const data = await response.json();
        toast.error(data.error || "Error al enviar el email");
      }
    } catch {
      toast.error("Error al enviar el email de verificación");
    } finally {
      setIsResending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verificando tu email...
          </h2>
          <p className="text-gray-600">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  if (error && token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Error en la Verificación
              </h1>
            </div>

            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>

              <Button
                onClick={() => setShowResend(true)}
                variant="outline"
                className="w-full"
              >
                Solicitar Nuevo Enlace
              </Button>

              <Button
                onClick={() => router.push("/login")}
                variant="ghost"
                className="w-full"
              >
                Volver a Iniciar Sesión
              </Button>
            </div>

            {showResend && (
              <form
                onSubmit={handleResendEmail}
                className="space-y-6 mt-8 pt-8 border-t border-gray-200"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    disabled={isResending}
                  />
                </div>

                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={isResending}
                  >
                    {isResending
                      ? "Enviando..."
                      : "Enviar Email de Verificación"}
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setShowResend(false)}
                    variant="outline"
                    className="w-full"
                    disabled={isResending}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Verificación de Email
            </h1>
            <p className="text-gray-600">
              Se te ha enviado un enlace de verificación a tu correo electrónico
            </p>
          </div>

          {!showResend ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>¿No recibiste el email?</strong>
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  Revisa tu carpeta de spam o solicita un nuevo enlace de
                  verificación.
                </p>
              </div>

              <Button
                onClick={() => setShowResend(true)}
                variant="outline"
                className="w-full"
              >
                Reenviar Email de Verificación
              </Button>

              <Button
                onClick={() => router.push("/login")}
                variant="ghost"
                className="w-full"
              >
                Volver a Iniciar Sesión
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResendEmail} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  disabled={isResending}
                />
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isResending}
                >
                  {isResending ? "Enviando..." : "Enviar Email de Verificación"}
                </Button>

                <Button
                  type="button"
                  onClick={() => setShowResend(false)}
                  variant="outline"
                  className="w-full"
                  disabled={isResending}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>
              ¿Aún no tienes cuenta?{" "}
              <a
                href="/auth/registro"
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Regístrate aquí
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Cargando...
            </h2>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
