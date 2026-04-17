import { config } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(config);

    // Only ADMIN and STAFF can view users list
    if (
      !session?.user ||
      (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role") || "CLIENT";

    const users = await prisma.user.findMany({
      where: {
        role: role as "ADMIN" | "STAFF" | "CLIENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      users,
      total: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
