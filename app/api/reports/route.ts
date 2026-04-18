import { config } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(config);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN and STAFF can access reports
    if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

    const period = request.nextUrl.searchParams.get("period") || "month"; // day, week, month
    const dateParam = request.nextUrl.searchParams.get("date");
    const baseDate = dateParam ? new Date(dateParam) : new Date();

    // Calculate date range based on period
    const startDate = new Date(baseDate);
    const endDate = new Date(baseDate);

    if (period === "day") {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === "week") {
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
      startDate.setDate(diff);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === "month") {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(startDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
    }

    // Fetch completed and confirmed appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ["CONFIRMED", "COMPLETED"],
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        staff: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
          },
        },
      },
    });

    // Calculate metrics
    const totalAppointments = appointments.length;
    const totalRevenue = appointments.reduce(
      (sum, apt) => sum + apt.service.price / 100,
      0,
    );
    const completedCount = appointments.filter(
      (apt) => apt.status === "COMPLETED",
    ).length;

    // Group by staff
    const staffStats: Record<
      string,
      {
        name: string;
        appointments: number;
        revenue: number;
      }
    > = {};

    appointments.forEach((apt) => {
      const staffId = apt.staff.id;
      if (!staffStats[staffId]) {
        staffStats[staffId] = {
          name: apt.staff.user.name,
          appointments: 0,
          revenue: 0,
        };
      }
      staffStats[staffId].appointments++;
      staffStats[staffId].revenue += apt.service.price / 100;
    });

    // Group by service
    const serviceStats: Record<
      string,
      {
        name: string;
        count: number;
        revenue: number;
      }
    > = {};

    appointments.forEach((apt) => {
      const serviceId = apt.service.id;
      if (!serviceStats[serviceId]) {
        serviceStats[serviceId] = {
          name: apt.service.name,
          count: 0,
          revenue: 0,
        };
      }
      serviceStats[serviceId].count++;
      serviceStats[serviceId].revenue += apt.service.price / 100;
    });

    // Group by day
    const dailyStats: Record<
      string,
      {
        date: string;
        appointments: number;
        revenue: number;
      }
    > = {};

    appointments.forEach((apt) => {
      const year = apt.date.getFullYear();
      const month = String(apt.date.getMonth() + 1).padStart(2, "0");
      const day = String(apt.date.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      if (!dailyStats[dateStr]) {
        dailyStats[dateStr] = {
          date: dateStr,
          appointments: 0,
          revenue: 0,
        };
      }
      dailyStats[dateStr].appointments++;
      dailyStats[dateStr].revenue += apt.service.price / 100;
    });

    return NextResponse.json({
      success: true,
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      summary: {
        totalAppointments,
        totalRevenue,
        completedCount,
        averageRevenue:
          totalAppointments > 0 ? totalRevenue / totalAppointments : 0,
      },
      staffStats: Object.values(staffStats)
        .map((stat) => ({
          ...stat,
          revenue: Number(stat.revenue.toFixed(2)),
        }))
        .sort((a, b) => b.appointments - a.appointments),
      serviceStats: Object.values(serviceStats)
        .map((stat) => ({
          ...stat,
          revenue: Number(stat.revenue.toFixed(2)),
        }))
        .sort((a, b) => b.count - a.count),
      dailyStats: Object.values(dailyStats)
        .map((stat) => ({
          ...stat,
          revenue: Number(stat.revenue.toFixed(2)),
        }))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
    });
  } catch (error) {
    console.error("[Reports API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 },
    );
  }
}
