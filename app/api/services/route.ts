import { config } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const all = searchParams.get("all") === "true";

    // Obtener servicios
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
      },
      ...(all ? {} : { take: 4 }),
      orderBy: [
        {
          staffServices: {
            _count: "desc",
          },
        },
        {
          createdAt: "desc",
        },
      ],
      include: {
        _count: {
          select: {
            appointments: true,
            staffServices: true,
          },
        },
      },
    });

    // Mapear a formato más legible
    const formattedServices = services.map((svc) => ({
      id: svc.id,
      name: svc.name,
      description: svc.description,
      duration: svc.duration,
      price: svc.price / 100, // convertir centavos a dólares
      staffCount: svc._count.staffServices,
      appointmentCount: svc._count.appointments,
    }));

    return NextResponse.json({
      services: formattedServices,
      success: true,
    });
  } catch (error) {
    console.error("[Services API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(config);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can create services
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

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

    const service = await prisma.service.create({
      data: {
        name,
        description: description || null,
        duration: parseInt(duration),
        price: priceInCents,
        isActive: true,
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
        id: service.id,
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price / 100,
        staffCount: service._count.staffServices,
        appointmentCount: service._count.appointments,
      },
      success: true,
    });
  } catch (error) {
    console.error("[Services API] POST Error:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 },
    );
  }
}
