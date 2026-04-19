import { sendWelcomeEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token de verificación requerido" },
        { status: 400 },
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Error del servidor" },
        { status: 500 },
      );
    }

    // Buscar el usuario con el token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Token no válido o ya expirado" },
        { status: 400 },
      );
    }

    // Verificar que el token no haya expirado
    if (
      user.emailVerificationTokenExpires &&
      new Date() > user.emailVerificationTokenExpires
    ) {
      return NextResponse.json(
        { error: "El token ha expirado. Solicita uno nuevo." },
        { status: 400 },
      );
    }

    // Actualizar el usuario: marcar email como verificado
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
        emailVerificationTokenExpires: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Enviar email de bienvenida después de verificar
    await sendWelcomeEmail({
      name: updatedUser.name,
      email: updatedUser.email,
    });

    // Devolver respuesta exitosa
    return NextResponse.json(
      {
        message: "Email verificado exitosamente. Por favor inicia sesión.",
        user: updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Verify Email API] Error:", error);
    return NextResponse.json(
      { error: "Error al verificar email" },
      { status: 500 },
    );
  }
}

// POST para resolicitar un nuevo token de verificación
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

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    // Si ya está verificado
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "El email ya ha sido verificado" },
        { status: 400 },
      );
    }

    // Generar nuevo token
    const { generateVerificationToken, sendVerificationEmail } =
      await import("@/lib/email");
    const newToken = generateVerificationToken();
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Actualizar usuario con nuevo token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: newToken,
        emailVerificationTokenExpires: tokenExpires,
      },
    });

    // Enviar email con nuevo token
    await sendVerificationEmail({
      name: user.name,
      email: user.email,
      token: newToken,
    });

    return NextResponse.json(
      { message: "Email de verificación enviado nuevamente" },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Resend Verification Email API] Error:", error);
    return NextResponse.json(
      { error: "Error al enviar email de verificación" },
      { status: 500 },
    );
  }
}
