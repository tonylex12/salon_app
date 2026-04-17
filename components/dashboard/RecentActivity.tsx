"use client";

import { Card } from "@/components/ui/card";
import { ActivitySkeletonLoader } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

interface Activity {
  id: string;
  description: string;
  serviceType: string;
  staffName: string;
  clientName: string;
  date: string;
  status: string;
  price: number;
  icon: string;
  createdAt: string;
}

interface RecentActivityProps {
  isLoading?: boolean;
}

export function RecentActivity({
  isLoading: initialLoading = false,
}: RecentActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(initialLoading);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/dashboard/activities");
        if (res.ok) {
          const data = await res.json();
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const colorClasses: Record<string, string> = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    red: "bg-red-500",
    amber: "bg-amber-500",
  };

  return (
    <Card className="bg-white border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-4 bg-linear-to-r from-slate-50 to-white">
        <h2 className="text-lg font-semibold text-slate-900">
          Actividad Reciente
        </h2>
      </div>
      <div className="divide-y divide-slate-200">
        {isLoading ? (
          <div className="p-6">
            <ActivitySkeletonLoader />
          </div>
        ) : activities.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            No hay actividad reciente
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="p-6 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-2 h-2 rounded-full ${
                    colorClasses[activity.icon as keyof typeof colorClasses] ||
                    "bg-slate-300"
                  } mt-2 shrink-0`}
                ></div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">
                    {activity.description}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {activity.serviceType}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Hoy a las{" "}
                    {new Date(activity.date).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · Estilista: {activity.staffName}
                  </p>
                </div>
                <span className="text-sm font-semibold text-green-600 shrink-0">
                  ${activity.price.toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
