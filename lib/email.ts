import { randomBytes } from "crypto";
import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface AppointmentEmailData {
  clientName: string;
  clientEmail: string;
  staffName?: string;
  serviceName: string;
  date: string;
  time: string;
  duration?: number;
  price?: number;
  appointmentId: string;
}

interface WelcomeEmailData {
  name: string;
  email: string;
}

interface EmailVerificationData {
  name: string;
  email: string;
  token: string;
}

// Generar token de verificación
export const generateVerificationToken = (): string => {
  return randomBytes(32).toString("hex");
};

// Crear transporte de Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });
};

// Función genérica para enviar emails
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
      console.error("Gmail credentials not configured");
      return false;
    }

    const transporter = createTransporter();

    const result = await transporter.sendMail({
      from: `${process.env.APP_NAME} <${process.env.GMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log("Email enviado:", result.messageId);
    return true;
  } catch (error) {
    console.error("Error enviando email:", error);
    return false;
  }
};

// Template: Email de verificación de email
const emailVerificationTemplate = (data: EmailVerificationData) => {
  const verificationLink = `${process.env.APP_URL}/auth/verify-email?token=${data.token}`;
  const expirationTime = "24 horas";

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: white; padding: 30px; }
        .verification-box { background-color: #f0f4ff; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px; }
        .verification-code { font-family: monospace; background-color: #e8f0ff; padding: 15px; text-align: center; border-radius: 4px; font-size: 14px; word-break: break-all; margin: 15px 0; }
        .action-button { display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin-top: 20px; font-weight: bold; }
        .footer { font-size: 12px; color: #666; text-align: center; padding: 20px; border-top: 1px solid #eee; margin-top: 20px; }
        .warning { color: #d32f2f; font-size: 13px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verifica tu Email</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${data.name}</strong>,</p>
          <p>Gracias por registrarte en ${process.env.APP_NAME}. Para completar tu registro y acceder a tu cuenta, necesitas verificar tu correo electrónico.</p>

          <div class="verification-box">
            <p><strong>Haz clic en el botón de abajo para verificar tu email:</strong></p>
            <center>
              <a href="${verificationLink}" class="action-button">Verificar Email</a>
            </center>
            <p style="text-align: center; margin-top: 15px; color: #666; font-size: 13px;">O copia este enlace en tu navegador:</p>
            <div class="verification-code">${verificationLink}</div>
          </div>

          <p><strong>Este enlace expira en ${expirationTime}.</strong></p>
          <p>Si no compartiste este correo electrónico con ${process.env.APP_NAME}, puedes ignorar este mensaje de forma segura.</p>

          <div class="warning">
            ⚠️ <strong>Importante:</strong> No compartas este enlace con nadie. Contiene un token privado para verificar tu email.
          </div>
        </div>
        <div class="footer">
          <p>${process.env.APP_NAME} - Gestión de Turnos para Salones</p>
          <p>© ${new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template: Email de confirmación de cita
const appointmentConfirmationTemplate = (data: AppointmentEmailData) => {
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: white; padding: 30px; }
        .appointment-details { background-color: #f0f4ff; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px; }
        .detail-row { display: flex; margin: 10px 0; }
        .detail-label { font-weight: bold; color: #667eea; width: 150px; }
        .detail-value { color: #333; }
        .action-button { display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        .footer { font-size: 12px; color: #666; text-align: center; padding: 20px; border-top: 1px solid #eee; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Cita Confirmada!</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${data.clientName}</strong>,</p>
          <p>Tu cita ha sido confirmada exitosamente. Aquí están los detalles:</p>

          <div class="appointment-details">
            <div class="detail-row">
              <div class="detail-label">📅 Fecha:</div>
              <div class="detail-value">${data.date}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">⏰ Hora:</div>
              <div class="detail-value">${data.time}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">💇 Servicio:</div>
              <div class="detail-value">${data.serviceName}</div>
            </div>
            ${
              data.staffName
                ? `
            <div class="detail-row">
              <div class="detail-label">👤 Estilista:</div>
              <div class="detail-value">${data.staffName}</div>
            </div>
            `
                : ""
            }
            ${
              data.duration
                ? `
            <div class="detail-row">
              <div class="detail-label">⏱️ Duración:</div>
              <div class="detail-value">${data.duration} minutos</div>
            </div>
            `
                : ""
            }
            ${
              data.price
                ? `
            <div class="detail-row">
              <div class="detail-label">💰 Precio:</div>
              <div class="detail-value">$${data.price}</div>
            </div>
            `
                : ""
            }
          </div>

          <p>Por favor llega 5 minutos antes de tu cita. Si necesitas cancelar o reprogramar, puedes hacerlo desde tu panel de control.</p>

          <center>
            <a href="${appUrl}/dashboard" class="action-button">Ver mis citas</a>
          </center>

          <p>Si tienes preguntas, no dudes en contactarnos.</p>
          <p>¡Gracias por elegirnos! 💅</p>
        </div>
        <div class="footer">
          <p>${process.env.APP_NAME} - Gestión de Turnos para Salones</p>
          <p>© ${new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template: Email de bienvenida (después de verificar)
const welcomeEmailTemplate = (data: WelcomeEmailData) => {
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: white; padding: 30px; }
        .welcome-text { font-size: 18px; color: #667eea; margin: 20px 0; }
        .features { margin: 20px 0; }
        .feature { margin: 15px 0; padding-left: 30px; position: relative; }
        .feature:before { content: "✓"; position: absolute; left: 0; color: #667eea; font-weight: bold; }
        .action-button { display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        .footer { font-size: 12px; color: #666; text-align: center; padding: 20px; border-top: 1px solid #eee; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Bienvenido a ${process.env.APP_NAME}!</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${data.name}</strong>,</p>

          <p class="welcome-text">Tu email ha sido verificado exitosamente. ¡Tu cuenta está lista!</p>

          <p>Con tu cuenta podrás:</p>
          <div class="features">
            <div class="feature">Reservar citas fácilmente con nuestros profesionales</div>
            <div class="feature">Ver tu historial de citas pasadas</div>
            <div class="feature">Gestionar tus datos personales y preferencias</div>
            <div class="feature">Recibir recordatorios de tus próximas citas</div>
          </div>

          <p>Para empezar, accede a tu panel de control y programa tu primera cita.</p>

          <center>
            <a href="${appUrl}/dashboard" class="action-button">Ir a mi panel</a>
          </center>

          <p>Si tienes alguna pregunta o necesitas ayuda, nuestro equipo está disponible para asistirte.</p>
          <p>¡Gracias por elegirnos! 💅</p>
        </div>
        <div class="footer">
          <p>${process.env.APP_NAME} - Gestión de Turnos para Salones</p>
          <p>© ${new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Función: Enviar email de verificación
export const sendVerificationEmail = async (data: EmailVerificationData) => {
  return sendEmail({
    to: data.email,
    subject: "Verifica tu correo electrónico en Salon Turnos",
    html: emailVerificationTemplate(data),
    text: `Hola ${data.name}, verifica tu email usando este token: ${data.token}`,
  });
};

// Función: Enviar email de confirmación de cita
export const sendAppointmentConfirmation = async (
  data: AppointmentEmailData,
) => {
  return sendEmail({
    to: data.clientEmail,
    subject: `Cita Confirmada - ${data.serviceName} el ${data.date}`,
    html: appointmentConfirmationTemplate(data),
    text: `Tu cita para ${data.serviceName} ha sido confirmada para el ${data.date} a las ${data.time}.`,
  });
};

// Función: Enviar email de bienvenida
export const sendWelcomeEmail = async (data: WelcomeEmailData) => {
  return sendEmail({
    to: data.email,
    subject: `¡Bienvenido a ${process.env.APP_NAME}!`,
    html: welcomeEmailTemplate(data),
    text: `Bienvenido ${data.name}. Tu email ha sido verificado exitosamente.`,
  });
};

// Función: Enviar email de cancelación de cita
export const sendCancellationEmail = async (
  clientEmail: string,
  clientName: string,
  serviceName: string,
  appointmentDate: string,
) => {
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: white; padding: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Cita Cancelada</h1>
        </div>
        <div class="content">
          <p>Hola ${clientName},</p>
          <p>Tu cita para <strong>${serviceName}</strong> programada para el <strong>${appointmentDate}</strong> ha sido cancelada.</p>
          <p>Si deseas reprogramar o tienes preguntas, no dudes en contactarnos.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: clientEmail,
    subject: `Cita Cancelada - ${serviceName}`,
    html,
  });
};
