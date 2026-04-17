import { config } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(config);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can delete staff
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

    // Check if staff has appointments
    const appointmentsCount = await prisma.appointment.count({
      where: { staffId: id },
    });

    if (appointmentsCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete staff member with appointments",
          appointments: appointmentsCount,
        },
        { status: 400 },
      );
    }

    // Get staff to find associated user
    const staff = await prisma.staff.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!staff) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 },
      );
    }

    // Delete staff profile (cascade will handle relationships)
    await prisma.staff.delete({
      where: { id },
    });

    // Delete associated user
    await prisma.user.delete({
      where: { id: staff.userId },
    });

    return NextResponse.json({
      success: true,
      message: "Staff member deleted successfully",
    });
  } catch (error) {
    console.error("[Staff API] DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete staff member" },
      { status: 500 },
    );
  }
}
