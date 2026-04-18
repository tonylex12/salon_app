"use client";

import { AppointmentBookingModal } from "@/components/dashboard/AppointmentBookingModal";
import { AppointmentDetailsModal } from "@/components/dashboard/AppointmentDetailsModal";
import { ScheduleCalendar } from "@/components/dashboard/ScheduleCalendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Staff {
  id: string;
  name: string;
}

interface AppointmentDetail {
  id: string;
  clientName: string;
  clientPhone: string;
  staffName: string;
  serviceName: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: string;
  clientId: string;
  staffId: string;
  serviceId: string;
}

export default function CalendarioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<{
    date: string;
    time: string;
  } | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentDetail | null>(null);
  const [isAppointmentDetailsOpen, setIsAppointmentDetailsOpen] =
    useState(false);
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  // Auth check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch data
  useEffect(() => {
    if (status !== "authenticated" || !session) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch staff
        const staffRes = await fetch("/api/staff");
        if (staffRes.ok) {
          const staffData = await staffRes.json();
          setStaff(staffData.staff || []);
          if (staffData.staff?.length > 0) {
            setSelectedStaffId(staffData.staff[0].id);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error al cargar los datos");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session, status]);

  const handleTimeSlotClick = (date: string, time: string) => {
    setSelectedDateTime({ date, time });
    setIsModalOpen(true);
  };

  const handleBookedSlotClick = (appointment: AppointmentDetail) => {
    setSelectedAppointment(appointment);
    setIsAppointmentDetailsOpen(true);
  };

  const handleWeekChange = (direction: "prev" | "next") => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + (direction === "prev" ? -7 : 7));
    setWeekStart(newDate);
  };

  const formatWeekRange = (date: Date) => {
    const weekEnd = new Date(date);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
      year: "numeric",
    };

    return `${date.toLocaleDateString("es-ES", options)} - ${weekEnd.toLocaleDateString("es-ES", options)}`;
  };

  const formatWeekRangeShort = (date: Date) => {
    const weekEnd = new Date(date);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const startDay = String(date.getDate()).padStart(2, "0");
    const startMonth = String(date.getMonth() + 1).padStart(2, "0");
    const startYear = date.getFullYear();

    const endDay = String(weekEnd.getDate()).padStart(2, "0");
    const endMonth = String(weekEnd.getMonth() + 1).padStart(2, "0");
    const endYear = weekEnd.getFullYear();

    return `${startDay}/${startMonth}/${startYear} - ${endDay}/${endMonth}/${endYear}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">
          <Card className="bg-white border-slate-200">
            <div className="p-6 md:p-12 text-center">
              <div className="animate-pulse space-y-4">
                <div className="h-6 md:h-8 bg-slate-200 rounded w-1/3 mx-auto" />
                <div className="h-64 md:h-96 bg-slate-200 rounded" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-white to-slate-50">
      {/* Content */}
      <div className="max-w-full mx-auto px-4 md:px-8 py-6 md:py-12">
        {/* Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8 max-w-7xl mx-auto">
          <div className="min-w-0 flex-1">
            {/* Mobile format: dd/mm/yyyy */}
            <h2 className="md:hidden text-lg font-semibold text-slate-900 truncate">
              {formatWeekRangeShort(weekStart)}
            </h2>
            {/* Desktop format: long format */}
            <h2 className="hidden md:block text-2xl font-semibold text-slate-900 truncate">
              {formatWeekRange(weekStart)}
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-4 w-full md:w-auto">
            {/* Staff Filter */}
            {staff.length > 0 && (
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="px-3 md:px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs md:text-sm"
              >
                <option value="">Todos los miembros</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            )}

            {/* Week Navigation */}
            <div className="flex gap-1 md:gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => handleWeekChange("prev")}
                className="flex-1 sm:flex-none text-xs md:text-sm px-2 md:px-3"
              >
                <span className="hidden sm:inline">←</span> Anterior
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const today = new Date();
                  const day = today.getDay();
                  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
                  setWeekStart(new Date(today.setDate(diff)));
                }}
                className="flex-1 sm:flex-none text-xs md:text-sm px-2 md:px-3"
              >
                Hoy
              </Button>
              <Button
                variant="outline"
                onClick={() => handleWeekChange("next")}
                className="flex-1 sm:flex-none text-xs md:text-sm px-2 md:px-3"
              >
                Siguiente <span className="hidden sm:inline">→</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <Card className="bg-white border-slate-200 overflow-x-auto">
          <ScheduleCalendar
            weekStart={weekStart}
            staffId={selectedStaffId}
            onTimeSlotClick={handleTimeSlotClick}
            onBookedSlotClick={handleBookedSlotClick}
            userRole={session?.user?.role as "ADMIN" | "STAFF" | "CLIENT"}
            userId={session?.user?.id}
          />
        </Card>
      </div>

      {/* Modals */}
      <AppointmentBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAppointmentBooked={() => {
          toast.success("Cita agendada exitosamente");
          setIsModalOpen(false);
          setSelectedDateTime(null);
        }}
        preSelectedDateTime={selectedDateTime}
      />

      <AppointmentDetailsModal
        isOpen={isAppointmentDetailsOpen}
        onClose={() => setIsAppointmentDetailsOpen(false)}
        appointment={selectedAppointment}
      />
    </div>
  );
}
