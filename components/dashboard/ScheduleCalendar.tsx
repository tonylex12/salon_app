"use client";

import { useEffect, useState } from "react";

interface TimeSlot {
  time: string;
  isAvailable: boolean;
  isBooked?: boolean;
  appointment?: AppointmentDetail;
}

interface DaySchedule {
  date: string;
  day: string;
  slots: TimeSlot[];
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  staffId: string;
  clientId: string;
  serviceId: string;
  status: string;
}

interface ScheduleCalendarProps {
  weekStart: Date;
  staffId?: string;
  onTimeSlotClick: (date: string, time: string) => void;
  onBookedSlotClick: (appointment: AppointmentDetail) => void;
  userRole?: "ADMIN" | "STAFF" | "CLIENT";
  userId?: string;
}

interface AppointmentDetail extends Appointment {
  clientName: string;
  clientPhone: string;
  staffName: string;
  serviceName: string;
  duration: number;
  price: number;
}

const HOURS = Array.from({ length: 18 }, (_, i) => {
  const hour = 6 + i;
  return `${String(hour).padStart(2, "0")}:00`;
});

export function ScheduleCalendar({
  weekStart,
  staffId,
  onTimeSlotClick,
  onBookedSlotClick,
  userRole,
  userId,
}: ScheduleCalendarProps) {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Normalize userRole to ensure it's valid
  const normalizedUserRole =
    userRole === "ADMIN"
      ? "ADMIN"
      : userRole === "STAFF"
        ? "STAFF"
        : userRole === "CLIENT"
          ? "CLIENT"
          : undefined;

  // Fetch schedule for the week
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoading(true);

        // Get current date and time
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );
        const currentHour = String(now.getHours()).padStart(2, "0");

        // Fetch existing appointments for this staff and week
        let bookedSlots: {
          date: string;
          time: string;
          appointment: AppointmentDetail;
        }[] = [];
        try {
          // For clients, fetch all appointments to see conflicts
          // For staff/admin, fetch their appointments
          // Include past appointments to show them in the calendar
          const url =
            normalizedUserRole === "CLIENT"
              ? "/api/appointments?showAll=true&includePast=true"
              : "/api/appointments?includePast=true";

          const appointmentsRes = await fetch(url);
          if (appointmentsRes.ok) {
            const appointmentsData = await appointmentsRes.json();
            const appointments: AppointmentDetail[] =
              appointmentsData.appointments || [];

            // Filter appointments for this staff (if staffId is provided) and this week
            bookedSlots = appointments
              .filter((apt: AppointmentDetail) => {
                if (staffId && apt.staffId !== staffId) return false;
                // Show all appointments (pasadas, actuales y futuras)
                return true;
              })
              .map((apt: AppointmentDetail) => {
                // Parse the ISO string to convert UTC to local timezone
                const dateObj = new Date(apt.date);

                // Get the local date and time (automatically handles timezone conversion)
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, "0");
                const day = String(dateObj.getDate()).padStart(2, "0");
                const localDate = `${year}-${month}-${day}`;

                const hour = String(dateObj.getHours()).padStart(2, "0");
                const minute = String(dateObj.getMinutes()).padStart(2, "0");
                const timeFormatted = `${hour}:${minute}`;

                return {
                  date: localDate,
                  time: timeFormatted,
                  appointment: apt,
                };
              });
          }
        } catch (error) {
          console.error("Error fetching appointments:", error);
        }

        // Generate week days inside useEffect to avoid infinite loop
        const weekDays = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(weekStart);
          date.setDate(date.getDate() + i);
          return date;
        });

        const daySchedules: DaySchedule[] = weekDays.map((date) => {
          // Use local timezone for date string
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const dateStr = `${year}-${month}-${day}`;
          const options: Intl.DateTimeFormatOptions = {
            weekday: "short",
            month: "2-digit",
            day: "2-digit",
          };
          const dayLabel = date.toLocaleDateString("es-ES", options);

          // Check if this date is in the past
          const dayWithoutTime = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
          );
          const isPastDay = dayWithoutTime < today;

          return {
            date: dateStr,
            day: dayLabel,
            slots: HOURS.map((hour) => {
              // Check if this slot is already booked
              const bookedSlot = bookedSlots.find(
                (slot) => slot.date === dateStr && slot.time === hour,
              );

              // If already booked
              if (bookedSlot) {
                // Always include appointment data, but we'll check permissions in the button
                return {
                  time: hour,
                  isAvailable: false,
                  isBooked: true,
                  appointment: bookedSlot.appointment,
                };
              }

              // Disable if it's a past day
              if (isPastDay) {
                return {
                  time: hour,
                  isAvailable: false,
                  isBooked: false,
                };
              }

              // If it's today, disable past hours and current hour
              if (dayWithoutTime.getTime() === today.getTime()) {
                return {
                  time: hour,
                  isAvailable: hour > currentHour, // Only future hours
                  isBooked: false,
                };
              }

              // Future days are available if not booked
              return {
                time: hour,
                isAvailable: true,
                isBooked: false,
              };
            }),
          };
        });

        setSchedule(daySchedules);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching schedule:", error);
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [weekStart, staffId, normalizedUserRole]);

  if (isLoading) {
    return (
      <div className="p-3 md:p-6 animate-pulse">
        <div className="h-64 md:h-96 bg-slate-200 rounded" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="p-3 md:p-6 min-w-min md:min-w-0">
        {/* Table */}
        <table className="w-full text-xs md:text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 md:py-4 px-2 md:px-4 font-semibold text-slate-900 w-12 md:w-20">
                Horario
              </th>
              {schedule.map((day) => (
                <th
                  key={day.date}
                  className="text-center py-3 md:py-4 px-1 md:px-2 font-semibold text-slate-900 min-w-28 md:min-w-35"
                >
                  <div className="text-xs uppercase tracking-wide text-slate-600 truncate">
                    {day.day.split(",")[0]}
                  </div>
                  <div className="text-base md:text-lg font-bold text-slate-900">
                    {day.day.split(" ")[1]}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {HOURS.map((hour) => (
              <tr
                key={hour}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="py-3 md:py-4 px-2 md:px-4 font-medium text-slate-900 text-xs md:text-sm whitespace-nowrap">
                  {hour}
                </td>

                {schedule.map((day) => {
                  const slot = day.slots.find((s) => s.time === hour);
                  const isAvailable = slot?.isAvailable ?? false;
                  const isBooked = slot?.isBooked ?? false;

                  // Determine if user can view appointment details
                  // Admin and staff can always view, clients can view their own appointments
                  const canViewDetails =
                    normalizedUserRole === "ADMIN" ||
                    normalizedUserRole === "STAFF" ||
                    (normalizedUserRole === "CLIENT" &&
                      userId &&
                      slot?.appointment?.clientId &&
                      userId === slot.appointment.clientId);

                  return (
                    <td
                      key={`${day.date}-${hour}`}
                      className="text-center py-3 md:py-4 px-1 md:px-2"
                    >
                      <button
                        onClick={() => {
                          if (isAvailable) {
                            onTimeSlotClick(day.date, hour);
                          } else if (
                            isBooked &&
                            slot?.appointment &&
                            canViewDetails
                          ) {
                            onBookedSlotClick(slot.appointment);
                          }
                        }}
                        disabled={
                          isAvailable === false &&
                          (isBooked === false ||
                            !slot?.appointment ||
                            !canViewDetails)
                        }
                        className={`w-full py-1 md:py-2 px-1 md:px-3 rounded text-xs md:text-sm font-medium transition-all ${
                          isAvailable
                            ? "bg-emerald-400 text-white hover:bg-emerald-500 cursor-pointer active:scale-95"
                            : isBooked && slot?.appointment && canViewDetails
                              ? "bg-primary text-white hover:bg-primary/90 cursor-pointer active:scale-95"
                              : "bg-slate-300 text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        <span className="hidden md:inline">
                          {isAvailable
                            ? "+ Reservar"
                            : isBooked
                              ? "Reservado"
                              : "+ No disponible"}
                        </span>
                        <span className="md:hidden">
                          {isAvailable ? "+" : isBooked ? "✓" : "✕"}
                        </span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
