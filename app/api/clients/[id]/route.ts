import { config } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateClientSchema = z.object({
  phone: z.string().min(1, "El teléfono es requerido"),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(config);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can update clients
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { phone } = updateClientSchema.parse(body);

    // Update client phone only
    const updatedClient = await prisma.user.update({
      where: { id },
      data: {
        phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    return NextResponse.json({
      message: "Cliente actualizado exitosamente",
      client: updatedClient,
      success: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        { message: firstError.message || "Validation error" },
        { status: 400 },
      );
    }
    console.error("[Update Client] Error:", error);
    return NextResponse.json(
      { message: "Error al actualizar el cliente" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(config);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can delete clients
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

    const { id } = await params;

    // Check if client has appointments
    const appointmentCount = await prisma.appointment.count({
      where: { clientId: id },
    });

    if (appointmentCount > 0) {
      return NextResponse.json(
        {
          message: `No se puede eliminar el cliente. Tiene ${appointmentCount} cita(s) agendada(s).`,
        },
        { status: 400 },
      );
    }

    // Delete client
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Cliente eliminado exitosamente",
      success: true,
    });
  } catch (error) {
    console.error("[Delete Client] Error:", error);
    return NextResponse.json(
      { message: "Error al eliminar el cliente" },
      { status: 500 },
    );
  }
}
