# 📋 Plan de Proyecto: Sistema de Gestión de Turnos y Reservas Online para Salones de Belleza

---

## 1. Resumen Ejecutivo

Sistema web integral para la gestión de turnos y reservas online dirigido a peluquerías, salones de belleza y centros de estética. La solución optimiza la administración de citas, mejora la experiencia del cliente y automatiza procesos clave del negocio.

**Categoría:** Programación y Tecnología — Programación Web
**Alcance:** Cambio mediano
**Tipo de proyecto:** Aplicación web full-stack, responsive y escalable

---

## 2. Stack Tecnológico

| Capa                | Tecnología                                   |
| ------------------- | -------------------------------------------- |
| Frontend            | Next.js 16.1 (App Router + Turbopack)        |
| Estilos             | Tailwind CSS + shadcn/ui                     |
| Backend / API       | Next.js API Routes                           |
| ORM                 | Prisma 7 (motor sin Rust, TypeScript nativo) |
| Base de datos       | PostgreSQL                                   |
| Autenticación       | NextAuth.js                                  |
| Notificaciones      | Nodemailer (email) / Twilio (SMS)            |
| Hosting recomendado | Vercel + Supabase o Railway                  |

### Novedades de Next.js 16 relevantes para este proyecto

- **Turbopack estable por defecto:** bundler predeterminado tanto en `next dev` como en `next build`, con hasta 5–10x más velocidad en Fast Refresh. No se necesita el flag `--turbopack`.
- **Cache Components (`use cache`):** nuevo modelo de caching explícito y opt-in. Todo el código dinámico se ejecuta en tiempo de request por defecto, lo que elimina comportamientos de caché inesperados. Se usa la directiva `"use cache"` para cachear componentes, páginas o funciones específicas (ideal para el catálogo de servicios y perfiles de profesionales).
- **`proxy.ts` reemplaza `middleware.ts`:** el archivo de middleware se renombra a `proxy.ts` y la función exportada a `proxy`. Corre en el runtime de Node.js. Se usará para la protección de rutas del dashboard.
- **React Compiler estable:** memoización automática de componentes sin necesidad de `useMemo` / `useCallback` manual.
- **React 19.2 + View Transitions:** soporte para animaciones de navegación nativas.
- **`params` y `searchParams` ahora son async:** en `page.tsx`, `layout.tsx` y route handlers, estos props deben awaitearse.

### Novedades de Prisma 7 relevantes para este proyecto

Prisma 7 (lanzado en noviembre 2025) es la actualización más significativa desde que el ORM se volvió estable. Los cambios que impactan directamente al proyecto son:

- **Motor sin Rust — reescrito en TypeScript:** el query engine ya no es un binario Rust separado. El cliente ahora corre como módulo WebAssembly directamente en el hilo principal de Node.js. Resultado: bundle un 90% más pequeño (de ~14MB a ~1.6MB) y arranques en frío mucho más rápidos en entornos serverless.
- **Nuevo provider `prisma-client`:** en `schema.prisma` se usa `provider = "prisma-client"` en lugar del anterior `provider = "prisma-client-js"`.
- **Driver adapter obligatorio:** en Prisma 7 se requiere pasar un adapter al instanciar `PrismaClient`. Para PostgreSQL se usa `@prisma/adapter-pg`:

  ```ts
  import { PrismaClient } from "@prisma/client";
  import { PrismaPg } from "@prisma/adapter-pg";

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  export const prisma = new PrismaClient({ adapter });
  ```

- **`prisma.config.ts` reemplaza configuración en `schema.prisma`:** la URL de la base de datos y otras configuraciones de datasource ahora van en un archivo `prisma.config.ts` en la raíz del proyecto, separando la configuración de los modelos.
- **El cliente se genera en node_modules:** por defecto Prisma 7 genera el cliente en `node_modules/.prisma/client/` (igual que Prisma 6+). Al no usar carpeta `src/`, importamos directamente desde `@prisma/client`.
- **Variables de entorno ya no se cargan automáticamente** desde `.env` al ejecutar la CLI — hay que cargarlas explícitamente o usar `dotenv`.

---

## 3. Arquitectura General

```
/
├── app/
│   ├── (public)/              # Páginas públicas (landing, reserva online)
│   │   ├── page.tsx           # Landing page
│   │   ├── reservar/
│   │   │   └── page.tsx       # Flujo de reserva
│   │   ├── mis-citas/
│   │   │   └── page.tsx       # Historial de citas del cliente
│   │   ├── login/
│   │   │   └── page.tsx       # Inicio de sesión
│   │   └── registro/
│   │       └── page.tsx       # Registro de clientes
│   ├── (dashboard)/           # Panel de administración (protegido)
│   │   ├── layout.tsx         # Layout del dashboard
│   │   ├── page.tsx           # Resumen/KPIs
│   │   ├── calendario/
│   │   │   └── page.tsx
│   │   ├── citas/
│   │   │   └── page.tsx
│   │   ├── clientes/
│   │   │   └── page.tsx
│   │   ├── servicios/
│   │   │   └── page.tsx
│   │   ├── personal/
│   │   │   └── page.tsx
│   │   ├── reportes/
│   │   │   └── page.tsx
│   │   └── configuracion/
│   │       └── page.tsx
│   ├── api/                   # API Routes de Next.js
│   │   ├── services/          # Rutas para servicios
│   │   ├── staff/             # Rutas para personal
│   │   ├── clients/           # Rutas para clientes
│   │   ├── appointments/      # Rutas para citas
│   │   └── auth/              # Rutas de autenticación (NextAuth)
│   ├── layout.tsx             # Layout raíz
│   └── globals.css            # Estilos globales
├── components/
│   ├── ui/                    # Componentes shadcn/ui (Button, Card, Dialog, etc.)
│   ├── booking/               # Componentes del flujo de reserva
│   │   ├── ServiceSelector.tsx
│   │   ├── StaffSelector.tsx
│   │   ├── DateTimeSelector.tsx
│   │   ├── ClientForm.tsx
│   │   └── BookingSummary.tsx
│   ├── dashboard/             # Componentes del panel admin
│   │   ├── Sidebar.tsx
│   │   ├── TopNav.tsx
│   │   ├── CalendarView.tsx
│   │   └── DataTable.tsx
│   └── shared/                # Componentes reutilizables
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── LoadingSpinner.tsx
├── lib/
│   ├── prisma.ts              # Instancia PrismaClient con adapter-pg
│   ├── auth.ts                # Configuración NextAuth.js
│   ├── notifications.ts       # Utilidades de email (Nodemailer)
│   └── utils.ts               # Funciones utilidarias
├── prisma/
│   ├── schema.prisma          # Esquema de modelos de BD
│   ├── migrations/            # Historial de migraciones
│   └── seed.ts                # Script de datos iniciales
├── prisma.config.ts           # Configuración de Prisma 7
├── proxy.ts                   # Protección de rutas y middlewares (Next.js 16)
├── types/
│   └── index.ts               # Tipos TypeScript globales
├── .env.local                 # Variables de entorno (gitignored)
├── .env.example               # Variables de entorno de ejemplo
├── next.config.ts             # Configuración de Next.js
├── tsconfig.json              # Configuración de TypeScript
├── tailwind.config.js         # Configuración de Tailwind CSS
└── package.json               # Dependencias del proyecto
```

---

## 4. Modelo de Base de Datos (Prisma Schema)

### Entidades principales

```prisma
// prisma/schema.prisma
// Nota: en Prisma 7 la URL del datasource va en prisma.config.ts

generator client {
  provider = "prisma-client"  // Nuevo en Prisma 7 (antes: "prisma-client-js")
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // Fallback; la config principal va en prisma.config.ts
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  phone     String?
  role      Role     @default(CLIENT)
  createdAt DateTime @default(now())

  appointments Appointment[]
  staff        Staff?
}

enum Role {
  ADMIN
  STAFF
  CLIENT
}

model Staff {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  bio         String?
  avatarUrl   String?
  schedule    Schedule[]
  services    StaffService[]
  appointments Appointment[]
}

model Service {
  id          String   @id @default(cuid())
  name        String
  description String?
  duration    Int      // en minutos
  price       Decimal
  isActive    Boolean  @default(true)

  staffServices StaffService[]
  appointments  Appointment[]
}

model StaffService {
  staffId   String
  serviceId String
  staff     Staff   @relation(fields: [staffId], references: [id])
  service   Service @relation(fields: [serviceId], references: [id])

  @@id([staffId, serviceId])
}

model Schedule {
  id        String   @id @default(cuid())
  staffId   String
  staff     Staff    @relation(fields: [staffId], references: [id])
  dayOfWeek Int      // 0=Domingo, 6=Sábado
  startTime String   // "09:00"
  endTime   String   // "18:00"
  isActive  Boolean  @default(true)
}

model Appointment {
  id          String            @id @default(cuid())
  clientId    String
  staffId     String
  serviceId   String
  date        DateTime
  status      AppointmentStatus @default(PENDING)
  notes       String?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  client  User    @relation(fields: [clientId], references: [id])
  staff   Staff   @relation(fields: [staffId], references: [id])
  service Service @relation(fields: [serviceId], references: [id])
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
  NO_SHOW
}
```

---

## 5. Módulos del Sistema y Funcionalidades

### 5.1 Módulo de Reservas Online (Público)

**Ruta:** `/reservar`

Flujo de reserva en pasos:

1. Selección de servicio (catálogo visual con duración y precio)
2. Selección de profesional (con foto, bio y disponibilidad)
3. Selección de fecha y hora (calendario interactivo)
4. Datos del cliente (formulario o login)
5. Confirmación y resumen de la cita

**API Routes involucradas:**

- `GET /api/services` — Lista servicios activos
- `GET /api/staff?serviceId=` — Lista profesionales por servicio
- `GET /api/availability?staffId=&date=` — Slots disponibles
- `POST /api/appointments` — Crear nueva cita

---

### 5.2 Gestión de Clientes

**Ruta:** `/dashboard/clientes`

Funcionalidades:

- Listado paginado y buscable de clientes
- Ficha de cliente: datos personales, historial de citas, servicios consumidos
- Registro de preferencias y notas internas
- Exportación básica de datos

**API Routes:**

- `GET /api/clients` — Listar clientes (con filtros y paginación)
- `GET /api/clients/[id]` — Detalle de cliente
- `PUT /api/clients/[id]` — Editar cliente
- `DELETE /api/clients/[id]` — Eliminar cliente

---

### 5.3 Gestión de Servicios

**Ruta:** `/dashboard/servicios`

Funcionalidades:

- CRUD completo de servicios
- Configuración de duración (en minutos) y precio
- Asignación de profesionales habilitados por servicio
- Activar/desactivar servicios sin eliminarlos

**API Routes:**

- `GET /api/services`
- `POST /api/services`
- `PUT /api/services/[id]`
- `DELETE /api/services/[id]`

---

### 5.4 Gestión de Personal

**Ruta:** `/dashboard/personal`

Funcionalidades:

- CRUD de perfiles de empleados (foto, bio, contacto)
- Configuración de horarios semanales (días y rangos horarios)
- Asignación de servicios que puede realizar cada profesional
- Vista de agenda individual por profesional

**API Routes:**

- `GET /api/staff`
- `POST /api/staff`
- `PUT /api/staff/[id]`
- `GET /api/staff/[id]/schedule`
- `PUT /api/staff/[id]/schedule`

---

### 5.5 Panel de Administración de Citas

**Ruta:** `/dashboard/citas`

Funcionalidades:

- Vista de lista y vista de calendario (día / semana / mes)
- Filtros por profesional, servicio, estado y fecha
- Edición y cancelación de citas
- Cambio de estado (Pendiente → Confirmada → Completada)
- Registro de observaciones por cita

**API Routes:**

- `GET /api/appointments` — Con filtros
- `PUT /api/appointments/[id]` — Editar cita
- `PATCH /api/appointments/[id]/status` — Cambiar estado
- `DELETE /api/appointments/[id]` — Cancelar cita

---

### 5.6 Notificaciones Automáticas

Triggers de notificación:

- **Confirmación de reserva:** al crear una cita (email al cliente)
- **Recordatorio:** 24 horas antes de la cita (email/SMS)
- **Cancelación:** al cancelar una cita (email al cliente)
- **Nueva cita:** notificación al profesional asignado

Implementación:

- Job de recordatorios con `node-cron` o mediante llamadas periódicas a un endpoint protegido
- Templates de email con React Email o Nodemailer con HTML
- SMS opcional con Twilio

---

### 5.7 Calendario Integrado

**Ruta:** `/dashboard/calendario`

Funcionalidades:

- Vista mensual, semanal y diaria
- Código de colores por estado de cita y por profesional
- Click en slot para ver detalle o crear nueva cita
- Filtro rápido por profesional
- Librería recomendada: `react-big-calendar` o `@fullcalendar/react`

---

### 5.8 Reportes Básicos

**Ruta:** `/dashboard/reportes`

Informes disponibles:

- Total de citas por período (con estado)
- Servicios más solicitados (ranking)
- Rendimiento por profesional (citas completadas, canceladas)
- Ingresos estimados por período
- Tasa de cancelaciones y no-shows

Visualización con gráficos usando `recharts` o `chart.js`.

---

## 6. Autenticación y Roles

Usando **NextAuth.js** con provider de credenciales (email + contraseña):

| Rol      | Acceso                                             |
| -------- | -------------------------------------------------- |
| `ADMIN`  | Acceso completo al dashboard y todas las funciones |
| `STAFF`  | Vista de su propia agenda y citas asignadas        |
| `CLIENT` | Reserva online, historial de sus propias citas     |

Protección de rutas mediante `proxy.ts` de Next.js 16 (reemplaza `middleware.ts`).

---

## 7. Estructura de Páginas

### Área pública

| Ruta         | Descripción                                |
| ------------ | ------------------------------------------ |
| `/`          | Landing page del salón                     |
| `/reservar`  | Flujo de reserva online (multi-step)       |
| `/mis-citas` | Historial de citas del cliente autenticado |
| `/login`     | Inicio de sesión                           |
| `/registro`  | Registro de nuevo cliente                  |

### Panel de administración

| Ruta                       | Descripción                    |
| -------------------------- | ------------------------------ |
| `/dashboard`               | Resumen general (KPIs del día) |
| `/dashboard/calendario`    | Calendario de citas            |
| `/dashboard/citas`         | Lista y gestión de citas       |
| `/dashboard/clientes`      | Gestión de clientes            |
| `/dashboard/servicios`     | Catálogo de servicios          |
| `/dashboard/personal`      | Gestión del personal           |
| `/dashboard/reportes`      | Informes y estadísticas        |
| `/dashboard/configuracion` | Ajustes generales del salón    |

---

## 8. Componentes UI Clave (shadcn/ui)

- `Calendar` + `DatePicker` — Selección de fechas
- `DataTable` — Tablas de clientes, citas, servicios
- `Dialog` / `Sheet` — Formularios de edición en modal
- `Badge` — Estados de citas
- `Card` — Tarjetas de servicios y profesionales
- `Tabs` — Navegación en dashboards
- `Select` / `Combobox` — Filtros y selecciones
- `Toast` — Notificaciones en pantalla
- `Form` + `Zod` — Validación de formularios

---

## 9. Fases de Desarrollo

### Fase 1 — Fundación (Semanas 1–2)

- Configuración del proyecto Next.js + Tailwind + shadcn/ui
- Configuración de Prisma + PostgreSQL
- Definición y migración del esquema de base de datos
- Configuración de NextAuth.js (autenticación por roles)
- Layout base del dashboard y área pública

### Fase 2 — Gestión de Datos (Semanas 3–4)

- CRUD de Servicios
- CRUD de Personal y horarios
- CRUD de Clientes
- API Routes correspondientes con validación (Zod)

### Fase 3 — Sistema de Reservas (Semanas 5–6)

- Flujo de reserva online multi-paso (público)
- Lógica de disponibilidad y slots libres
- Creación y confirmación de citas
- Panel de gestión de citas (lista + cambio de estado)

### Fase 4 — Calendario y Notificaciones (Semana 7)

- Vista de calendario integrado en el dashboard
- Integración de notificaciones por email (confirmación y recordatorio)
- Job de recordatorios automáticos

### Fase 5 — Reportes y Pulido (Semana 8)

- Módulo de reportes y gráficos
- Responsive design y ajustes de UX/UI
- Optimización de rendimiento con `"use cache"` en páginas estáticas (catálogo, perfiles)
- Pruebas generales y corrección de errores

---

## 10. Consideraciones Técnicas

### Disponibilidad y slots

La lógica de disponibilidad debe:

1. Obtener el horario semanal del profesional
2. Obtener las citas ya agendadas para esa fecha
3. Calcular slots libres según la duración del servicio seleccionado
4. Excluir slots solapados o con tiempo insuficiente

### Escalabilidad

- Uso de índices en PostgreSQL para consultas frecuentes (por fecha, staffId, clientId)
- Paginación en todas las listas
- Rate limiting en API Routes públicas (para evitar spam de reservas)

### Responsive Design

- Mobile-first con Tailwind CSS
- Menú lateral colapsable en móvil
- Formulario de reserva optimizado para touch

### Seguridad

- Validación de entrada con Zod en todas las API Routes
- Rutas del dashboard protegidas con `proxy.ts` (Next.js 16) + NextAuth
- Variables de entorno para credenciales (`.env.local`)
- Sanitización de datos antes de insertar en la BD

---

## 11. Variables de Entorno Necesarias

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Email (Nodemailer)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-password
EMAIL_FROM=noreply@tusalon.com

# SMS - Opcional (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

> **Nota Prisma 7:** la URL de la base de datos también debe declararse en `prisma.config.ts` para que los comandos de la CLI (`prisma migrate dev`, `prisma db push`, etc.) funcionen correctamente, ya que Prisma 7 ya no carga `.env` automáticamente.

```ts
// prisma.config.ts
import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
```

---

## 12. Dependencias Principales

```json
{
  "dependencies": {
    "next": "^16.1.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "@prisma/client": "^7.0.0",
    "@prisma/adapter-pg": "^7.0.0",
    "next-auth": "^5.0.0",
    "zod": "^3.22.0",
    "react-big-calendar": "^1.8.0",
    "date-fns": "^3.0.0",
    "nodemailer": "^6.9.0",
    "recharts": "^2.10.0",
    "react-hook-form": "^7.49.0",
    "@hookform/resolvers": "^3.3.0",
    "node-cron": "^3.0.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "prisma": "^7.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^4.0.0"
  }
}
```

---

## 13. Criterios de Éxito

- [ ] Un cliente puede reservar una cita completa desde su celular en menos de 2 minutos
- [ ] El administrador puede gestionar citas, personal y servicios desde el dashboard
- [ ] Las notificaciones de confirmación llegan automáticamente por email
- [ ] El calendario muestra disponibilidad en tiempo real
- [ ] Los reportes básicos están disponibles con datos del período seleccionado
- [ ] La aplicación es completamente responsive en móvil, tablet y escritorio
- [ ] Las rutas del dashboard están protegidas según el rol del usuario

---

_Documento generado para el desarrollo del sistema de turnos y reservas online para salones de belleza._
