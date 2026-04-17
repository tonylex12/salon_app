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

    // Solo ADMIN y STAFF pueden acceder a actividades
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

    // Obtener actividad reciente (últimas 4 citas)
    const activities = await prisma.appointment.findMany({
      take: 4,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
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
          },
        },
      },
    });

    // Mapear a formato para mostrar
    const formattedActivities = activities.map((apt) => {
      let description = "";
      let icon = "blue"; // default color

      if (apt.status === "CONFIRMED") {
        description = `Cita confirmada: ${apt.client.name}`;
        icon = "green";
      } else if (apt.status === "PENDING") {
        description = `Cita pendiente: ${apt.client.name}`;
        icon = "blue";
      } else if (apt.status === "COMPLETED") {
        description = `Cita completada: ${apt.client.name}`;
        icon = "green";
      } else if (apt.status === "CANCELLED") {
        description = `Cita cancelada: ${apt.client.name}`;
        icon = "red";
      }

      return {
        id: apt.id,
        description,
        serviceType: apt.service.name,
        staffName: apt.staff.user.name,
        clientName: apt.client.name,
        date: apt.date,
        status: apt.status,
        price: apt.service.price / 100,
        icon,
        createdAt: apt.createdAt,
      };
    });

    return NextResponse.json({
      activities: formattedActivities,
      success: true,
    });
  } catch (error) {
    console.error("[Dashboard Activities] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 },
    );
  }
}
