"use client";

import { ServiceCreateModal } from "@/components/dashboard/ServiceCreateModal";
import { ServiceDeleteModal } from "@/components/dashboard/ServiceDeleteModal";
import { ServiceEditModal } from "@/components/dashboard/ServiceEditModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  staffCount: number;
  appointmentCount: number;
}

const ServiceSkeletonLoader = () => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-24 bg-slate-200 rounded" />
    ))}
  </div>
);

export default function ServiciosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
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

  // Fetch services
  useEffect(() => {
    if (status !== "authenticated" || !session) return;

    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/services?all=true");
        if (res.ok) {
          const data = await res.json();
          setServices(data.services || []);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error("Error al cargar los servicios");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [session, status]);

  // Filter services by search term
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleRefreshServices = async () => {
    try {
      const res = await fetch("/api/services?all=true");
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.error("Error refreshing services:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-linear-to-br from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="space-y-4 animate-pulse">
            <div className="h-10 w-48 bg-slate-200 rounded" />
            <ServiceSkeletonLoader />
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
            Gestión de Servicios
          </h1>
          <p className="text-slate-600 mt-2">
            Administra los servicios ofrecidos en tu salón
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header with CTA */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Servicios</h2>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Crear Nuevo Servicio
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Buscar por nombre del servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Services List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="bg-white border-slate-200 overflow-hidden">
              <div className="p-6">
                <ServiceSkeletonLoader />
              </div>
            </Card>
          ) : filteredServices.length === 0 ? (
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-slate-600 text-lg">
                  {searchTerm
                    ? "No se encontraron servicios"
                    : "No hay servicios registrados"}
                </p>
              </div>
            </Card>
          ) : (
            filteredServices.map((service) => (
              <Card
                key={service.id}
                className="bg-white border-slate-200 hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-900">
                        {service.name}
                      </h3>

                      {service.description && (
                        <p className="text-sm text-slate-600 mt-1 mb-4">
                          {service.description}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {/* Duration */}
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs text-slate-600 font-medium mb-1">
                            Duración
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {service.duration} min
                          </p>
                        </div>

                        {/* Price */}
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs text-slate-600 font-medium mb-1">
                            Precio
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            ${service.price.toFixed(2)}
                          </p>
                        </div>

                        {/* Appointments */}
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs text-slate-600 font-medium mb-1">
                            Citas
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {service.appointmentCount}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-4 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setEditingService(service)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeletingService(service)}
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
        {filteredServices.length > 0 && (
          <div className="mt-8">
            <div className="p-4 bg-slate-100 rounded-lg text-center">
              <p className="text-slate-600">
                Mostrando{" "}
                <span className="font-semibold">{filteredServices.length}</span>{" "}
                de <span className="font-semibold">{services.length}</span>{" "}
                servicios
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Service Modals */}
      <ServiceCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onServiceCreated={handleRefreshServices}
      />

      <ServiceEditModal
        isOpen={editingService !== null}
        service={editingService}
        onClose={() => setEditingService(null)}
        onServiceUpdated={handleRefreshServices}
      />

      <ServiceDeleteModal
        isOpen={deletingService !== null}
        service={deletingService}
        onClose={() => setDeletingService(null)}
        onServiceDeleted={handleRefreshServices}
      />
    </div>
  );
}
