# 📖 Salon App

## Visión General

**Salon App** es una aplicación web moderna **full‑stack** para la gestión de citas en salones de belleza, personal, servicios y la interacción con los clientes. Construida con **Next.js 16**, **Tailwind CSS**, **shadcn/ui** y **Prisma 7**, ofrece una UI premium y responsiva respaldada por una base de datos PostgreSQL robusta.

---

## ✨ Características Clave

- **Flujo de reserva público** – sistema de reserva multi‑paso con selección de servicio, profesional y fecha/hora.
- **Panel de Administración** – gestiona clientes, horarios del personal, servicios, citas, reportes y configuraciones.
- **Autenticación y roles** – **NextAuth.js** con roles ADMIN, STAFF y CLIENT.
- **Notificaciones** – correo electrónico (Nodemailer) y SMS opcional (Twilio) para confirmaciones y recordatorios.
- **Integración de calendario** – visualiza reservas mediante `react-big-calendar` o `@fullcalendar/react`.
- **Reportes** – análisis de citas, ingresos y desempeño del personal.
- **Diseño responsivo** – UI móvil‑first con soporte de modo oscuro.

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|------------|
| Frontend | **Next.js 16** (App Router, Turbopack) |
| UI | **Tailwind CSS**, **shadcn/ui**, **Radix UI** |
| Formularios | **react‑hook‑form** + **Zod** |
| Autenticación | **NextAuth.js** |
| Backend | **Rutas API de Next.js** |
| Base de datos | **PostgreSQL** vía **Prisma 7** (adapter‑pg) |
| Email | **Nodemailer** |
| SMS (opcional) | **Twilio** |
| Deploy | **Vercel** (frontend) + **Supabase/Railway** (PostgreSQL) |
| CI/CD | GitHub Actions (opcional) |

---

## 🚀 Comenzar

### Prerrequisitos

- Node.js ≥ 20
- pnpm / npm / yarn (según prefieras)
- Base de datos PostgreSQL
- (Opcional) cuenta de Twilio para SMS

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/your-org/salon_app.git
cd salon_app

# Instalar dependencias
npm install   # o pnpm install / yarn install

# Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tu configuración (ver abajo)

# Generar el cliente Prisma
npx prisma generate

# Ejecutar migraciones (asegúrate de que DATABASE_URL esté definido)
npx prisma migrate dev --name init
```

### Desarrollo

```bash
npm run dev   # Inicia el servidor de desarrollo en http://localhost:3000
```
> El servidor usa Turbopack para recarga instantánea y React 19.2 con transiciones de vista.

### Construcción para Producción

```bash
npm run build   # Genera la versión optimizada para producción
npm start       # Ejecuta la aplicación construida
```

---

## 📦 Scripts

| Script | Descripción |
|--------|-------------|
| `dev` | Inicia el servidor de desarrollo |
| `build` | Genera el bundle de producción |
| `start` | Ejecuta la aplicación en producción |
| `lint` | Ejecuta ESLint |
| `seed` | Poblado inicial de la base de datos |
| `db:reset` | Restablece migraciones y vuelve a sembrar |

---

## 🔧 Configuración

### Variables de Entorno (`.env.local`)

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
NEXTAUTH_SECRET=tu‑clave‑secreta
NEXTAUTH_URL=http://localhost:3000

# Email (Nodemailer)
SMTP_HOST=smtp.ejemplo.com
SMTP_PORT=587
SMTP_USER=tu@email.com
SMTP_PASS=tu‑contraseña
EMAIL_FROM=noreply@tusalon.com

# SMS (opcional – Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```
> Prisma 7 utiliza `prisma.config.ts` para la configuración del datasource; revisa ese archivo para más detalles.

---

## 📂 Estructura del Proyecto (alto nivel)

```
app/                     # Páginas de Next.js (App Router)
  (public)/            # Landing, flujo de reserva, etc.
  (dashboard)/         # Área protegida de administración
  api/                 # Rutas API (servicios, personal, citas…)
  layout.tsx, page.tsx
  globals.css
components/              # Componentes UI (shadcn/ui, compartidos, reserva, dashboard)
lib/                     # Helpers (cliente Prisma, auth, notificaciones)
prisma/                  # Esquema Prisma y migraciones
  prisma.config.ts      # Configuración de Prisma 7
public/                  # Assets estáticos
types/                   # Tipos TypeScript globales
next.config.ts           # Configuración de Next.js (proxy.ts, etc.)
tailwind.config.js       # Configuración de Tailwind CSS
README.md                # **Este archivo** – documentación del proyecto
```

---

## 📚 Recursos y Documentación

- **Documentación de Next.js 16** – `node_modules/next/dist/docs/`
- **Documentación de Prisma 7** – https://pris.ly/7
- **shadcn/ui** – https://ui.shadcn.com/
- **Tailwind CSS** – https://tailwindcss.com/

---

## 🤝 Contribuir

1. Haz fork del repositorio.
2. Crea una rama de característica (`git checkout -b feat/funcionalidad‑genial`).
3. Asegúrate de que el código pase lint y formateo (`npm run lint`).
4. Abre un Pull Request con una descripción clara.

---

## 📄 Licencia

MIT © 2026 Tony Huerto

---

## 🙏 Agradecimientos

Desarrollado con pasión por el equipo **Salon App**, aprovechando las últimas funcionalidades de Next.js, Prisma y modernas librerías UI.
