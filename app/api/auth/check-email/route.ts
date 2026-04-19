import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Error del servidor" },
        { status: 500 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { exists: false, emailVerified: null },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        exists: true,
        emailVerified: !!user.emailVerified,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Check Email Verification] Error:", error);
    return NextResponse.json(
      { error: "Error al verificar email" },
      { status: 500 },
    );
  }
}
