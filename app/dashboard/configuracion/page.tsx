"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ConfiguracionPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Profile update state
  const [profileForm, setProfileForm] = useState({
    name: session?.user?.name || "",
    phone: session?.user?.phone || "",
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Redirect if not authenticated
  if (!session) {
    router.push("/auth/login");
    return null;
  }

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!passwordForm.currentPassword.trim()) {
      toast.error("Por favor ingresa tu contraseña actual");
      return;
    }

    if (!passwordForm.newPassword.trim()) {
      toast.error("Por favor ingresa una nueva contraseña");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al cambiar la contraseña");
      }

      toast.success("Contraseña actualizada correctamente");

      // Clear password form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al cambiar la contraseña",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!profileForm.name.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }

    if (!profileForm.phone.trim()) {
      toast.error("El teléfono no puede estar vacío");
      return;
    }

    setProfileLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profileForm.name.trim(),
          phone: profileForm.phone.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al actualizar el perfil");
      }

      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al actualizar el perfil",
      );
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-white to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-bold text-slate-900 font-serif">
            Configuración
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-2">
            Gestiona tu perfil y contraseña de forma segura
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Password Change Card */}
          <Card className="bg-white border-slate-200 p-6 md:p-8 shadow-sm">
            <h2 className="mb-6 text-lg md:text-xl font-semibold text-slate-900">
              Cambiar Contraseña
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="current-password"
                  className="text-sm font-medium text-slate-700"
                >
                  Contraseña Actual
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="Ingresa tu contraseña actual"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className="border-slate-200 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="new-password"
                  className="text-sm font-medium text-slate-700"
                >
                  Nueva Contraseña
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Ingresa la nueva contraseña"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="border-slate-200 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirm-password"
                  className="text-sm font-medium text-slate-700"
                >
                  Confirmar Contraseña
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirma la nueva contraseña"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="border-slate-200 focus:ring-primary"
                />
              </div>

              <Button
                type="submit"
                disabled={passwordLoading}
                className="w-full mt-2 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-2"
              >
                {passwordLoading ? (
                  <>
                    <Loader className="mr-2 size-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Contraseña"
                )}
              </Button>
            </form>
          </Card>

          {/* Profile Update Card */}
          <Card className="bg-white border-slate-200 p-6 md:p-8 shadow-sm">
            <h2 className="mb-6 text-lg md:text-xl font-semibold text-slate-900">
              Actualizar Perfil
            </h2>
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700"
                >
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={session?.user?.email}
                  value={session?.user?.email || ""}
                  disabled
                  className="bg-slate-50 border-slate-200 text-slate-600 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500">
                  No puedes cambiar tu correo electrónico
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-slate-700"
                >
                  Nombre
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ingresa tu nombre"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      name: e.target.value,
                    })
                  }
                  className="border-slate-200 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-slate-700"
                >
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Ingresa tu teléfono"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      phone: e.target.value,
                    })
                  }
                  className="border-slate-200 focus:ring-primary"
                />
              </div>

              <Button
                type="submit"
                disabled={profileLoading}
                className="w-full mt-2 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-2"
              >
                {profileLoading ? (
                  <>
                    <Loader className="mr-2 size-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Perfil"
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
