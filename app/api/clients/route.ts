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

    // Only ADMIN can access clients
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

    // Get pagination params from query
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = 20;
    const skip = (page - 1) * pageSize;

    // Get total count of clients
    const totalCount = await prisma.user.count({
      where: {
        role: "CLIENT",
      },
    });

    // Get clients with appointment count (paginated)
    const clients = await prisma.user.findMany({
      where: {
        role: "CLIENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        appointments: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
    });

    // Format with appointment count
    const formattedClients = clients.map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone || "",
      createdAt: client.createdAt.toISOString(),
      appointmentCount: client.appointments.length,
    }));

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      clients: formattedClients,
      pagination: {
        page,
        pageSize,
        totalPages,
        totalCount,
      },
      success: true,
    });
  } catch (error) {
    console.error("[Clients API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 },
    );
  }
}
