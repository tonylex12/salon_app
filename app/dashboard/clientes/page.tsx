"use client";

import { ClientDeleteModal } from "@/components/dashboard/ClientDeleteModal";
import { ClientEditModal } from "@/components/dashboard/ClientEditModal";
import { ClientSearch } from "@/components/dashboard/ClientSearch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  appointmentCount: number;
}

const ClientSkeletonLoader = () => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-20 bg-slate-200 rounded" />
    ))}
  </div>
);

export default function ClientesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    // Solo ADMIN puede ver esta página
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (
      status !== "authenticated" ||
      !session ||
      session.user?.role !== "ADMIN"
    )
      return;

    const fetchClients = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/clients?page=${currentPage}`);
        if (res.ok) {
          const data = await res.json();
          setClients(data.clients || []);
          setTotalPages(data.pagination.totalPages);
          setTotalCount(data.pagination.totalCount);
        } else if (res.status === 401 || res.status === 403) {
          toast.error("No tienes permiso para ver esta página");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("Error al cargar los clientes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [currentPage, status]);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phone && client.phone.includes(searchTerm)),
  );

  const handleRefreshClients = async () => {
    try {
      setCurrentPage(1);
      const res = await fetch("/api/clients?page=1");
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
      }
    } catch (error) {
      console.error("Error refreshing clients:", error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-linear-to-br from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="space-y-4 animate-pulse">
            <div className="h-10 w-48 bg-slate-200 rounded" />
            <ClientSkeletonLoader />
          </div>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-white to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 font-serif">
            Gestión de Clientes
          </h1>
          <p className="text-slate-600 mt-2">
            Administra la información de tus clientes
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <ClientSearch onSearchChange={setSearchTerm} />
        </div>

        {/* Clients List */}
        <div className="space-y-3">
          {isLoading ? (
            <Card className="bg-white border-slate-200 overflow-hidden">
              <div className="p-6">
                <ClientSkeletonLoader />
              </div>
            </Card>
          ) : filteredClients.length === 0 ? (
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3.545M9 21H1.545M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-slate-600 text-lg">
                  {searchTerm
                    ? "No se encontraron clientes"
                    : "No hay clientes"}
                </p>
              </div>
            </Card>
          ) : (
            filteredClients.map((client) => (
              <Card
                key={client.id}
                className="bg-white border-slate-200 hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-900">
                        {client.name}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {/* Email */}
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs text-slate-600 font-medium mb-1">
                            📧 Email
                          </p>
                          <p className="text-sm text-slate-900 break-all">
                            {client.email}
                          </p>
                        </div>

                        {/* Phone */}
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs text-slate-600 font-medium mb-1">
                            📞 Teléfono
                          </p>
                          <p className="text-sm text-slate-900">
                            {client.phone || "No especificado"}
                          </p>
                        </div>

                        {/* Appointment Count */}
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs text-slate-600 font-medium mb-1">
                            📅 Citas
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {client.appointmentCount}
                          </p>
                        </div>
                      </div>

                      {/* Created Date */}
                      <p className="text-xs text-slate-500 mt-3">
                        Registrado: {formatDate(client.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="ml-4 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setEditingClient(client)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeletingClient(client)}
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

        {/* Stats Footer with Pagination */}
        {!isLoading && clients.length > 0 && (
          <div className="mt-8 space-y-4">
            {/* Stats */}
            <div className="p-4 bg-slate-100 rounded-lg text-center">
              <p className="text-slate-600">
                Mostrando{" "}
                <span className="font-semibold">{clients.length}</span> de{" "}
                <span className="font-semibold">{totalCount}</span> clientes
                {searchTerm && (
                  <>
                    {" "}
                    | Página{" "}
                    <span className="font-semibold">{currentPage}</span> de{" "}
                    <span className="font-semibold">{totalPages}</span>
                  </>
                )}
              </p>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  ← Anterior
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNum = index + 1;
                    const isActive = pageNum === currentPage;
                    return (
                      <Button
                        key={pageNum}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={isLoading}
                        className="min-w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages || isLoading}
                >
                  Siguiente →
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingClient && (
        <ClientEditModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onSuccess={() => {
            setEditingClient(null);
            handleRefreshClients();
          }}
        />
      )}

      {/* Delete Modal */}
      {deletingClient && (
        <ClientDeleteModal
          client={deletingClient}
          onClose={() => setDeletingClient(null)}
          onSuccess={() => {
            setDeletingClient(null);
            handleRefreshClients();
          }}
        />
      )}
    </div>
  );
}
