import { prisma } from "@/lib/prisma";
import { SignUpSchema } from "@/types";
import { hash } from "bcryptjs";

export async function POST(request: Request) {
  try {
    if (!prisma) {
      console.error("[Register] Prisma client not available");
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

    // Crear nuevo usuario
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "CLIENT", // Los nuevos usuarios son clientes por defecto
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return Response.json(
      {
        message: "Usuario registrado exitosamente",
        user,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error en registro:", error);
    return Response.json(
      { error: "Error al registrar usuario" },
      { status: 500 },
    );
  }
}
