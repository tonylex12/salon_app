import { generateVerificationToken, sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { SignUpSchema } from "@/types";
import { hash } from "bcryptjs";

export async function POST(request: Request) {
  try {
    if (!prisma) {
      return Response.json(
        { error: "Error del servidor: base de datos no disponible" },
        { status: 500 },
      );
    }

    const body = await request.json();

    // Validar datos con Zod schema
    const validation = SignUpSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        { error: "Datos inválidos", details: validation.error.issues },
        { status: 400 },
      );
    }

    const { email, password, name } = validation.data;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return Response.json(
        { error: "El email ya está registrado" },
        { status: 409 },
      );
    }

    // Hashear la contraseña
    const hashedPassword = await hash(password, 10);

    // Generar token de verificación
    const verificationToken = generateVerificationToken();
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Crear nuevo usuario con token de verificación
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "CLIENT", // Los nuevos usuarios son clientes por defecto
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpires: tokenExpires,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Enviar email de verificación
    await sendVerificationEmail({
      name: user.name,
      email: user.email,
      token: verificationToken,
    });

    return Response.json(
      {
        message:
          "Usuario registrado. Por favor verifica tu email para continuar.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[Register API] Error:", error);
    return Response.json(
      { error: "Error al registrar usuario" },
      { status: 500 },
    );
  }
}
