import { config } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(config);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can edit services
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
    const { name, description, duration, price } = body;

    if (!name || !duration || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Convert price from dollars to cents
    const priceInCents = Math.round(parseFloat(price) * 100);

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name,
        description: description || null,
        duration: parseInt(duration),
        price: priceInCents,
      },
      include: {
        _count: {
          select: {
            appointments: true,
            staffServices: true,
          },
        },
      },
    });

    return NextResponse.json({
      service: {
        id: updatedService.id,
        name: updatedService.name,
        description: updatedService.description,
        duration: updatedService.duration,
        price: updatedService.price / 100,
        staffCount: updatedService._count.staffServices,
        appointmentCount: updatedService._count.appointments,
      },
      success: true,
    });
  } catch (error) {
    console.error("[Services API] PUT Error:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
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

    // Only ADMIN can delete services
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

    // Check if service has appointments
    const appointmentsCount = await prisma.appointment.count({
      where: { serviceId: id },
    });

    if (appointmentsCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete service with appointments",
          appointments: appointmentsCount,
        },
        { status: 400 },
      );
    }

    // Soft delete by setting isActive to false
    await prisma.service.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("[Services API] DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 },
    );
  }
}
