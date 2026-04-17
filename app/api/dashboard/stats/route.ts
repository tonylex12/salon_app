import { config } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(config);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as "ADMIN" | "STAFF" | "CLIENT";

    // Solo ADMIN y STAFF pueden acceder a estadísticas
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

    // Definir "hoy" al inicio
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Citas Pendientes (PENDING + CONFIRMED)
    const pendingAppointments = await prisma.appointment.count({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        date: {
          gte: today,
        },
      },
    });

    // 2. Clientes Nuevos (esta semana)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const newClients = await prisma.user.count({
      where: {
        role: "CLIENT",
        createdAt: {
          gte: weekStart,
        },
      },
    });

    // 3. Ingresos de hoy
    const todayAppointments = await prisma.appointment.findMany({
      where: {
        status: "COMPLETED",
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        service: true,
      },
    });

    const revenueToday = todayAppointments.reduce(
      (sum, apt) => sum + (apt.service?.price || 0),
      0,
    );

    // 4. Ocupación (%)
    // Calcular slots disponibles de hoy
    const staffMembers = await prisma.staff.findMany({
      include: {
        schedule: true,
      },
    });

    let totalSlots = 0;
    let occupiedSlots = 0;

    const dayOfWeek = today.getDay();
    const thirtyMinSlots = 11 * 2; // 9am-6pm = 9 hours = 18 slots de 30 min por staff

    for (const staff of staffMembers) {
      const schedule = staff.schedule.find(
        (s) => s.dayOfWeek === dayOfWeek && s.isActive,
      );

      if (schedule) {
        totalSlots += thirtyMinSlots; // 18 slots por staff

        // Contar citas confirmadas para este staff hoy
        const confirmedApts = await prisma.appointment.count({
          where: {
            staffId: staff.id,
            status: { in: ["CONFIRMED", "COMPLETED"] },
            date: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        });

        occupiedSlots += confirmedApts;
      }
    }

    const occupancyPercentage =
      totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

    // 5. Variación vs día anterior
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayAppointments = await prisma.appointment.findMany({
      where: {
        status: "COMPLETED",
        date: {
          gte: yesterday,
          lt: today,
        },
      },
      include: {
        service: true,
      },
    });

    const revenueYesterday = yesterdayAppointments.reduce(
      (sum, apt) => sum + (apt.service?.price || 0),
      0,
    );

    const revenueDiff = revenueToday - revenueYesterday;

    return NextResponse.json({
      pendingAppointments,
      newClients,
      revenueToday: revenueToday / 100, // convertir a dólares
      revenueDiff: revenueDiff / 100,
      occupancyPercentage,
      success: true,
    });
  } catch (error) {
    console.error("[Dashboard Stats] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
