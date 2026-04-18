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

    if (!prisma) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

    const userRole = session.user.role as "ADMIN" | "STAFF" | "CLIENT";
    const userId = session.user.id;
    const showAll = request.nextUrl.searchParams.get("showAll") === "true";
    const includePast =
      request.nextUrl.searchParams.get("includePast") === "true";

    // Construir filtro según el rol
    let whereClause: Record<string, unknown> = {};

    if (userRole === "CLIENT") {
      // Los clientes ven solo sus citas por defecto
      // pero pueden ver todas si showAll=true (para el calendario)
      if (showAll) {
        // Mostrar todas las citas (incluyendo pasadas si es solicitado)
        if (includePast) {
          // Ver todas las citas (sin filtro de fecha)
          whereClause = {};
        } else {
          // Ver solo citas futuras
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          whereClause = {
            date: {
              gte: today,
            },
          };
        }
      } else {
        // Mostrar solo las citas del cliente (futuras por defecto)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        whereClause = {
          clientId: userId,
          date: {
            gte: today,
          },
        };
      }
    } else if (userRole === "STAFF") {
      // El staff ve todas las citas
      if (includePast) {
        // Ver todas las citas (incluyendo pasadas)
        whereClause = {};
      } else {
        // Ver solo citas futuras
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        whereClause = {
          date: {
            gte: today,
          },
        };
      }
    } else {
      // ADMIN ve todas las citas
      if (includePast) {
        // Ver todas las citas (incluyendo pasadas)
        whereClause = {};
      } else {
        // Ver solo citas futuras
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        whereClause = {
          date: {
            gte: today,
          },
        };
      }
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

    // Mapear a formato más legible con control de acceso
    const formattedAppointments = appointments.map((apt) => {
      // Extract date in local timezone, not UTC
      const year = apt.date.getFullYear();
      const month = String(apt.date.getMonth() + 1).padStart(2, "0");
      const day = String(apt.date.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      // Check if this appointment belongs to the current user
      const isOwnAppointment = userRole === "CLIENT" && apt.clientId === userId;

      // For CLIENT users viewing all appointments (calendar mode),
      // restrict data exposure for appointments that don't belong to them
      if (userRole === "CLIENT" && showAll && !isOwnAppointment) {
        // Return minimal data for other users' appointments
        return {
          id: apt.id,
          staffId: apt.staffId,
          clientId: apt.clientId,
          serviceId: apt.serviceId,
          date: apt.date.toISOString(),
          time: apt.date.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: apt.status,
          // Don't expose: clientName, clientPhone, serviceName, staffName, price, notes, duration
        };
      }

      // For own appointments or ADMIN/STAFF, return full data
      return {
        id: apt.id,
        staffId: apt.staffId,
        clientId: apt.clientId,
        serviceId: apt.serviceId,
        serviceName: apt.service.name,
        staffName: apt.staff.user.name,
        clientName: apt.client.name,
        clientPhone: apt.client.phone,
        date: apt.date.toISOString(),
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

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(config);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN and STAFF can update appointments
    if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { appointmentId, status } = body;

    if (!appointmentId || !status) {
      return NextResponse.json(
        { error: "Missing required fields: appointmentId, status" },
        { status: 400 },
      );
    }

    // Validate status
    const validStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

    // Update appointment status
    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
      include: {
        client: {
          select: { name: true, email: true, phone: true },
        },
        staff: {
          select: {
            user: {
              select: { name: true },
            },
          },
        },
        service: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({
      message: "Appointment updated successfully",
      appointment,
      success: true,
    });
  } catch (error) {
    console.error("[Appointments PUT API] Error:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(config);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN and STAFF can delete appointments
    if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { appointmentId } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Missing required field: appointmentId" },
        { status: 400 },
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

    // Delete appointment
    await prisma.appointment.delete({
      where: { id: appointmentId },
    });

    return NextResponse.json({
      message: "Appointment deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("[Appointments DELETE API] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 },
    );
  }
}
