import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import "dotenv/config";
import { Pool } from "pg";
import { PrismaClient } from "../app/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // Limpiar datos existentes
  console.log("🗑️  Limpiando datos existentes...");
  await prisma.appointment.deleteMany();
  await prisma.scheduleException.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.staffService.deleteMany();
  await prisma.service.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.user.deleteMany();

  // ============= CREAR USUARIOS =============
  console.log("👥 Creando usuarios...");

  // Usuario ADMIN
  const adminPassword = await hash("Admin@2024", 10);
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@salon.local",
      password: adminPassword,
      name: "Administrador",
      phone: "+34 600 123 456",
      role: "ADMIN",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    },
  });
  console.log("✅ Usuario ADMIN creado:", adminUser.email);

  // Usuario STAFF (Estilista)
  const staffPassword = await hash("Staff@2024", 10);
  const staffUser = await prisma.user.create({
    data: {
      email: "laura@salon.local",
      password: staffPassword,
      name: "Laura Martínez",
      phone: "+34 600 234 567",
      role: "STAFF",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=laura",
    },
  });
  console.log("✅ Usuario STAFF creado:", staffUser.email);

  // Usuario CLIENT (Cliente)
  const clientPassword = await hash("Client@2024", 10);
  const clientUser = await prisma.user.create({
    data: {
      email: "cliente@example.com",
      password: clientPassword,
      name: "María García",
      phone: "+34 600 345 678",
      role: "CLIENT",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
    },
  });
  console.log("✅ Usuario CLIENT creado:", clientUser.email);

  // ============= CREAR PERFIL DE STAFF =============
  console.log("💼 Creando perfil de staff...");

  const staffProfile = await prisma.staff.create({
    data: {
      userId: staffUser.id,
      bio: "Estilista profesional con 8 años de experiencia en cortes y peinados.",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=laura-staff",
    },
  });
  console.log("✅ Perfil de staff creado");

  // ============= CREAR SERVICIOS =============
  console.log("💇 Creando servicios...");

  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: "Corte",
        description: "Corte de cabello personalizado",
        duration: 30,
        price: 4500, // $45.00
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Peinado",
        description: "Peinado profesional para eventos especiales",
        duration: 60,
        price: 6500, // $65.00
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Manicura",
        description: "Manicura y esmaltado",
        duration: 45,
        price: 5000, // $50.00
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Pedicura",
        description: "Pedicura y esmaltado",
        duration: 60,
        price: 5500, // $55.00
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Corte y Peinado",
        description: "Combo: Corte + Peinado",
        duration: 75,
        price: 9500, // $95.00
        isActive: true,
      },
    }),
  ]);

  console.log(
    `✅ ${services.length} servicios creados:`,
    services.map(({ name }: { name: string }) => name),
  );

  // ============= ASIGNAR SERVICIOS A STAFF =============
  console.log("🔗 Asignando servicios al staff...");

  const staffServices = await Promise.all(
    services.map(({ id }: { id: string }) =>
      prisma.staffService.create({
        data: {
          staffId: staffProfile.id,
          serviceId: id,
        },
      }),
    ),
  );

  console.log(`✅ ${staffServices.length} servicios asignados al staff`);

  // ============= CREAR HORARIOS =============
  console.log("📅 Creando horarios de trabajo...");

  // Horarios: Lunes a Viernes 9:00 - 18:00, Sábado 10:00 - 14:00
  const schedules = await Promise.all([
    // Lunes
    prisma.schedule.create({
      data: {
        staffId: staffProfile.id,
        dayOfWeek: 1, // Lunes
        startTime: new Date("2024-01-01 09:00:00"),
        endTime: new Date("2024-01-01 18:00:00"),
        isActive: true,
      },
    }),
    // Martes
    prisma.schedule.create({
      data: {
        staffId: staffProfile.id,
        dayOfWeek: 2, // Martes
        startTime: new Date("2024-01-01 09:00:00"),
        endTime: new Date("2024-01-01 18:00:00"),
        isActive: true,
      },
    }),
    // Miércoles
    prisma.schedule.create({
      data: {
        staffId: staffProfile.id,
        dayOfWeek: 3, // Miércoles
        startTime: new Date("2024-01-01 09:00:00"),
        endTime: new Date("2024-01-01 18:00:00"),
        isActive: true,
      },
    }),
    // Jueves
    prisma.schedule.create({
      data: {
        staffId: staffProfile.id,
        dayOfWeek: 4, // Jueves
        startTime: new Date("2024-01-01 09:00:00"),
        endTime: new Date("2024-01-01 18:00:00"),
        isActive: true,
      },
    }),
    // Viernes
    prisma.schedule.create({
      data: {
        staffId: staffProfile.id,
        dayOfWeek: 5, // Viernes
        startTime: new Date("2024-01-01 09:00:00"),
        endTime: new Date("2024-01-01 18:00:00"),
        isActive: true,
      },
    }),
    // Sábado
    prisma.schedule.create({
      data: {
        staffId: staffProfile.id,
        dayOfWeek: 6, // Sábado
        startTime: new Date("2024-01-01 10:00:00"),
        endTime: new Date("2024-01-01 14:00:00"),
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ ${schedules.length} horarios de trabajo creados`);

  // ============= CREAR EXCEPCIONES DE HORARIO =============
  console.log("🏖️  Creando excepciones de horario...");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Vacaciones el 25 de Diciembre
  const xmasException = await prisma.scheduleException.create({
    data: {
      staffId: staffProfile.id,
      date: new Date("2026-12-25"),
      isUnavailable: true,
      reason: "Navidad",
    },
  });

  console.log(`✅ ${xmasException.id ? 1 : 0} excepción de horario creada`);

  // ============= CREAR CITAS =============
  console.log("📅 Creando citas...");

  // Cita 1: Corte - Completada HOY
  const appointment1 = await prisma.appointment.create({
    data: {
      clientId: clientUser.id,
      staffId: staffProfile.id,
      serviceId: services[0].id, // Corte
      date: new Date("2026-04-17 10:00:00"),
      endTime: new Date("2026-04-17 10:30:00"),
      status: "COMPLETED",
      notes: "Cliente prefiere corte clásico",
    },
  });

  // Cita 2: Peinado - Completada HOY
  const appointment2 = await prisma.appointment.create({
    data: {
      clientId: clientUser.id,
      staffId: staffProfile.id,
      serviceId: services[1].id, // Peinado
      date: new Date("2026-04-17 11:00:00"),
      endTime: new Date("2026-04-17 12:00:00"),
      status: "COMPLETED",
      notes: "Evento especial - Boda",
    },
  });

  // Cita 3: Manicura - Completada HOY
  const appointment3 = await prisma.appointment.create({
    data: {
      clientId: clientUser.id,
      staffId: staffProfile.id,
      serviceId: services[2].id, // Manicura
      date: new Date("2026-04-17 14:00:00"),
      endTime: new Date("2026-04-17 14:45:00"),
      status: "COMPLETED",
      notes: "Color: Rosa pastel",
    },
  });

  // Cita 4: Corte y Peinado - Confirmada MAÑANA
  const appointment4 = await prisma.appointment.create({
    data: {
      clientId: clientUser.id,
      staffId: staffProfile.id,
      serviceId: services[4].id, // Combo
      date: new Date("2026-04-18 11:00:00"),
      endTime: new Date("2026-04-18 12:15:00"),
      status: "CONFIRMED",
      notes: "Cambio de imagen",
    },
  });

  console.log(
    `✅ Citas creadas: ${[appointment1, appointment2, appointment3, appointment4].length}`,
  );

  // ============= RESUMEN =============
  console.log("\n" + "=".repeat(50));
  console.log("✅ SEED COMPLETADO EXITOSAMENTE");
  console.log("=".repeat(50));
  console.log("\n📊 Datos creados:");
  console.log("  • Usuarios: 3 (ADMIN, STAFF, CLIENT)");
  console.log("  • Servicios: 5");
  console.log("  • Horarios: 6 (Lunes a Sábado)");
  console.log("  • Citas: 4");
  console.log("\n🔐 Credenciales de prueba:");
  console.log("  ADMIN:");
  console.log("    Email: admin@salon.local");
  console.log("    Password: Admin@2024");
  console.log("\n  STAFF:");
  console.log("    Email: laura@salon.local");
  console.log("    Password: Staff@2024");
  console.log("\n  CLIENT:");
  console.log("    Email: cliente@example.com");
  console.log("    Password: Client@2024");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
