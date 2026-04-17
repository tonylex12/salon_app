"use client";

import { Card } from "@/components/ui/card";
import { ServiceSkeletonLoader } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

interface Service {
  id: string;
  name: string;
  appointmentCount: number;
}

export function PopularServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const servicesRes = await fetch("/api/services");
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          setServices(servicesData.services || []);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching services:", error);
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Colores para las barras de servicios
  const colorGradients = [
    "from-blue-500 to-blue-600",
    "from-purple-500 to-purple-600",
    "from-pink-500 to-pink-600",
    "from-emerald-500 to-emerald-600",
  ];

  // Calcular el máximo de citas para normalizar las barras
  const maxAppointments = services.length
    ? Math.max(...services.map((s) => s.appointmentCount))
    : 0;

  return (
    <Card className="bg-white border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-4 bg-linear-to-r from-slate-50 to-white">
        <h3 className="text-base font-semibold text-slate-900">
          Servicios Populares
        </h3>
      </div>
      <div className="p-6 space-y-4">
        {isLoading ? (
          <ServiceSkeletonLoader />
        ) : services.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No hay servicios disponibles
          </div>
        ) : (
          services.map((service, index) => {
            const percentage =
              maxAppointments > 0
                ? (service.appointmentCount / maxAppointments) * 100
                : 0;
            const gradientClass = colorGradients[index % colorGradients.length];

            return (
              <div key={service.id}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">
                    {service.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {service.appointmentCount}
                  </p>
                </div>
                <div className="bg-slate-100 rounded-full h-1.5">
                  <div
                    className={`bg-linear-to-r ${gradientClass} h-1.5 rounded-full transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
