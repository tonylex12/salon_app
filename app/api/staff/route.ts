import { config } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(config);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can access staff list
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

    // Get all staff members
    const staff = await prisma.staff.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        services: {
          select: {
            serviceId: true,
            service: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            appointments: true,
            schedule: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format response
    const formattedStaff = staff.map((s) => ({
      id: s.id,
      userId: s.user.id,
      name: s.user.name,
      email: s.user.email,
      phone: s.user.phone || "",
      bio: s.bio,
      avatarUrl: s.avatarUrl,
      servicesCount: s.services.length,
      appointmentsCount: s._count.appointments,
      scheduleCount: s._count.schedule,
      createdAt: s.createdAt.toISOString(),
    }));

    return NextResponse.json({
      staff: formattedStaff,
      success: true,
    });
  } catch (error) {
    console.error("[Staff API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
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

    // Only ADMIN can create staff
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
    const { name, email, phone, password, bio } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with STAFF role and staff profile
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: "STAFF",
      },
    });

    const staffProfile = await prisma.staff.create({
      data: {
        userId: user.id,
        bio: bio || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({
      staff: {
        id: staffProfile.id,
        userId: staffProfile.user.id,
        name: staffProfile.user.name,
        email: staffProfile.user.email,
        phone: staffProfile.user.phone || "",
        bio: staffProfile.bio,
        servicesCount: 0,
        appointmentsCount: 0,
        scheduleCount: 0,
      },
      success: true,
    });
  } catch (error) {
    console.error("[Staff API] POST Error:", error);
    return NextResponse.json(
      { error: "Failed to create staff member" },
      { status: 500 },
    );
  }
}
