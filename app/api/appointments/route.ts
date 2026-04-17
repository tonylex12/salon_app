import { config } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(config);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

    const userRole = session.user.role as "ADMIN" | "STAFF" | "CLIENT";
    const userId = session.user.id;

    // Construir filtro según el rol
    let whereClause: Record<string, unknown> = {};

    if (userRole === "CLIENT") {
      // Los clientes solo ven sus propias citas
      whereClause = {
        clientId: userId,
        date: {
          gte: new Date(), // No mostrar citas pasadas
        },
      };
    } else if (userRole === "STAFF") {
      // El staff ve todas las citas del día
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      whereClause = {
        date: {
          gte: today,
        },
      };
    } else {
      // ADMIN ve todas las citas del día
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      whereClause = {
        date: {
          gte: today,
        },
      };
    }

    // Obtener citas
    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      orderBy: {
        date: "asc",
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
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
            duration: true,
            price: true,
          },
        },
      },
    });

    // Mapear a formato más legible
    const formattedAppointments = appointments.map((apt) => {
      // Extract date in local timezone, not UTC
      const year = apt.date.getFullYear();
      const month = String(apt.date.getMonth() + 1).padStart(2, "0");
      const day = String(apt.date.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      return {
        id: apt.id,
        serviceName: apt.service.name,
        staffName: apt.staff.user.name,
        clientName: apt.client.name,
        clientPhone: apt.client.phone,
        date: apt.date.toISOString(), // Send full ISO datetime to preserve timezone
        time: apt.date.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        duration: apt.service.duration,
        price: apt.service.price / 100,
        status: apt.status,
        statusColor:
          apt.status === "CONFIRMED"
            ? "green"
            : apt.status === "PENDING"
              ? "blue"
              : apt.status === "COMPLETED"
                ? "green"
                : "red",
        notes: apt.notes,
      };
    });

    return NextResponse.json({
      appointments: formattedAppointments,
      count: formattedAppointments.length,
      success: true,
    });
  } catch (error) {
    console.error("[Appointments API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(config);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { clientId, serviceId, staffId, date, endTime, notes } = body;

    // Validate required fields
    if (!clientId || !serviceId || !staffId || !date || !endTime) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // CLIENT users can only create appointments for themselves
    if (session.user.role === "CLIENT" && session.user.id !== clientId) {
      return NextResponse.json(
        { message: "Clients can only book appointments for themselves" },
        { status: 403 },
      );
    }

    // Verify staff exists
    const staffExists = await prisma.staff.findUnique({
      where: { id: staffId },
    });

    if (!staffExists) {
      return NextResponse.json(
        { message: "Staff member not found" },
        { status: 404 },
      );
    }

    // Check for conflicts
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        staffId,
        date: {
          gte: new Date(date),
          lt: new Date(endTime),
        },
      },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { message: "Time slot is already booked" },
        { status: 409 },
      );
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        clientId,
        serviceId,
        staffId,
        date: new Date(date),
        endTime: new Date(endTime),
        notes: notes || null,
        status: "PENDING",
      },
      include: {
        client: {
          select: { name: true, email: true },
        },
        service: {
          select: { name: true, duration: true },
        },
        staff: {
          select: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Appointment created successfully",
        appointment,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[Appointments POST API] Error:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 },
    );
  }
}
