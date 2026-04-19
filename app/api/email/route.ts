import {
  sendAppointmentConfirmation,
  sendCancellationEmail,
  sendWelcomeEmail,
} from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type) {
      return NextResponse.json(
        { error: "El tipo de email es requerido" },
        { status: 400 },
      );
    }

    let result = false;

    switch (type) {
      case "appointment-confirmation":
        if (
          !data.clientEmail ||
          !data.clientName ||
          !data.serviceName ||
          !data.date ||
          !data.time
        ) {
          return NextResponse.json(
            { error: "Faltan datos requeridos para la confirmación de cita" },
            { status: 400 },
          );
        }
        result = await sendAppointmentConfirmation(data);
        break;

      case "welcome":
        if (!data.email || !data.name) {
          return NextResponse.json(
            { error: "Faltan datos requeridos para el email de bienvenida" },
            { status: 400 },
          );
        }
        result = await sendWelcomeEmail(data);
        break;

      case "cancellation":
        if (
          !data.clientEmail ||
          !data.clientName ||
          !data.serviceName ||
          !data.appointmentDate
        ) {
          return NextResponse.json(
            { error: "Faltan datos requeridos para la cancelación" },
            { status: 400 },
          );
        }
        result = await sendCancellationEmail(
          data.clientEmail,
          data.clientName,
          data.serviceName,
          data.appointmentDate,
        );
        break;

      default:
        return NextResponse.json(
          { error: "Tipo de email no soportado" },
          { status: 400 },
        );
    }

    if (result) {
      return NextResponse.json(
        { success: true, message: "Email enviado correctamente" },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Error al enviar el email" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error en endpoint de email:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
