"use client";

import { StaffCreateModal } from "@/components/dashboard/StaffCreateModal";
import { StaffDeleteModal } from "@/components/dashboard/StaffDeleteModal";
import { StaffEditPhoneModal } from "@/components/dashboard/StaffEditPhoneModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface StaffMember {
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

const StaffSkeletonLoader = () => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-24 bg-slate-200 rounded" />
    ))}
  </div>
);

export default function PersonalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Auth check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    // Only ADMIN can access this page
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  // Fetch staff
  useEffect(() => {
    if (status !== "authenticated" || !session) return;

    const fetchStaff = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/staff");
        if (res.ok) {
          const data = await res.json();
          setStaff(data.staff || []);
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
        toast.error("Error al cargar el personal");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, [session, status]);

  // Filter staff by search term
  const filteredStaff = staff.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleRefreshStaff = async () => {
    try {
      const res = await fetch("/api/staff");
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff || []);
        setEditingStaff(null);
      }
    } catch (error) {
      console.error("Error refreshing staff:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-linear-to-br from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="space-y-4 animate-pulse">
            <div className="h-10 w-48 bg-slate-200 rounded" />
            <StaffSkeletonLoader />
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-white to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 font-serif">
            Gestión de Personal
          </h1>
          <p className="text-slate-600 mt-2">
            Administra los miembros de tu equipo
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header with CTA */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Personal</h2>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Crear Nuevo Miembro
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Staff List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="bg-white border-slate-200 overflow-hidden">
              <div className="p-6">
                <StaffSkeletonLoader />
              </div>
            </Card>
          ) : filteredStaff.length === 0 ? (
            <Card className="bg-white border-slate-200 overflow-hidden">
              <div className="p-12 text-center">
                <svg
                  className="w-16 h-16 text-slate-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <p className="text-slate-600 text-lg">
                  {searchTerm
                    ? "No se encontró personal"
                    : "No hay personal registrado"}
                </p>
              </div>
            </Card>
          ) : (
            filteredStaff.map((member) => (
              <Card
                key={member.id}
                className="bg-white border-slate-200 hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-900">
                        {member.name}
                      </h3>

                      {member.bio && (
                        <p className="text-sm text-slate-600 mt-1 mb-4">
                          {member.bio}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {/* Email */}
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs text-slate-600 font-medium mb-1">
                            Email
                          </p>
                          <p className="text-sm font-semibold text-slate-900 break-all">
                            {member.email}
                          </p>
                        </div>

                        {/* Phone */}
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs text-slate-600 font-medium mb-1">
                            Teléfono
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {member.phone || "No especificado"}
                          </p>
                        </div>

                        {/* Citas */}
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs text-slate-600 font-medium mb-1">
                            Citas
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {member.appointmentsCount}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingStaff(member)}
                      >
                        Editar Teléfono
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeletingStaff(member)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Stats Footer */}
        {filteredStaff.length > 0 && (
          <div className="mt-8">
            <div className="p-4 bg-slate-100 rounded-lg text-center">
              <p className="text-slate-600">
                Mostrando{" "}
                <span className="font-semibold">{filteredStaff.length}</span> de{" "}
                <span className="font-semibold">{staff.length}</span> miembros
                del personal
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Staff Modals */}
      <StaffCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onStaffCreated={handleRefreshStaff}
      />

      <StaffDeleteModal
        isOpen={deletingStaff !== null}
        staff={deletingStaff}
        onClose={() => setDeletingStaff(null)}
        onStaffDeleted={handleRefreshStaff}
      />

      <StaffEditPhoneModal
        staff={editingStaff}
        isOpen={!!editingStaff}
        onClose={() => setEditingStaff(null)}
        onSuccess={handleRefreshStaff}
      />
    </div>
  );
}
