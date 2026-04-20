"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100">
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-2xl font-serif font-bold text-slate-900">
            Salón
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#salon"
              className="text-sm text-slate-700 hover:text-slate-900 transition"
            >
              Salón
            </Link>
            <Link
              href="#spa"
              className="text-sm text-slate-700 hover:text-slate-900 transition"
            >
              Spa
            </Link>
            <Link
              href="#contacto"
              className="text-sm text-slate-700 hover:text-slate-900 transition"
            >
              Contacto
            </Link>
          </div>
          <div>
            {session ? (
              <Link href="/dashboard">
                <Button className="bg-slate-900 text-white hover:bg-slate-800">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-slate-900 text-slate-900"
                >
                  Inicia Sesión
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-16 ng-gradient-to-b from-slate-50 to-white">
        <div
          className="relative h-96 md:h-screen bg-cover bg-center overflow-hidden"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
            backgroundPosition: "center",
          }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Hero Content */}
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center text-white px-6">
              <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
                Tu Belleza, Nuestra Prioridad
              </h1>
              <p className="text-xl text-slate-200 mb-8">
                Reserva tu cita y vive la mejor experiencia de belleza
              </p>
              <Link href="/reservar">
                <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-full py-3 px-8 text-base font-semibold">
                  Reservar Cita
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">
            Servicios de belleza excepcionales
          </h2>
          <p className="text-lg text-slate-700 leading-relaxed">
            En Salón contamos con profesionales especializados en corte,
            manicura, pedicura, tratamientos faciales y mucho más. Reserva tu
            cita hoy mismo y descubre la experiencia de belleza que mereces.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-slate-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Flexibilidad
              </h3>
              <p className="text-slate-600">
                Elige cuándo y qué servicio deseas con nuestras opciones sin
                limitaciones
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-slate-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Calidad Premium
              </h3>
              <p className="text-slate-600">
                Acceso a nuestros mejores profesionales y productos de lujo
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-slate-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Experiencia Memorable
              </h3>
              <p className="text-slate-600">
                Crea momentos especiales en un ambiente de relajación y lujo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-12 text-center">
            Nuestros Servicios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Service 1 */}
            <div className="group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all">
              <div
                className="h-64 bg-cover bg-center overflow-hidden"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                }}
              >
                {/* Optional overlay for better text contrast if needed */}
              </div>
              <div className="p-6 bg-white">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Corte & Styling
                </h3>
                <p className="text-slate-600 text-sm">
                  Servicios de corte y peinado con nuestros mejores estilistas
                </p>
              </div>
            </div>

            {/* Service 2 */}
            <div className="group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all">
              <div
                className="h-64 bg-cover bg-center overflow-hidden"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&q=80')",
                }}
              >
                {/* Optional overlay for better text contrast if needed */}
              </div>
              <div className="p-6 bg-white">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Tratamientos Faciales
                </h3>
                <p className="text-slate-600 text-sm">
                  Rejuvenecimiento y cuidado integral de la piel
                </p>
              </div>
            </div>

            {/* Service 3 */}
            <div className="group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all">
              <div
                className="h-64 bg-cover bg-center overflow-hidden"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&q=80')",
                }}
              >
                {/* Optional overlay for better text contrast if needed */}
              </div>
              <div className="p-6 bg-white">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Manicura & Pedicura
                </h3>
                <p className="text-slate-600 text-sm">
                  Cuidado profesional de manos y pies
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-serif font-bold mb-4">
            Prepárate para transformarte
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Nuestros expertos están listos para brindarte la mejor experiencia
          </p>
          <Link href="/reservar">
            <Button className="bg-white text-slate-900 hover:bg-slate-100 font-semibold px-8 py-3 rounded-full">
              Reservar Ahora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-serif text-xl mb-4">Salón</h3>
              <p className="text-sm">
                Tu destino para servicios de belleza y bienestar de calidad
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Servicios</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Cortes
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Tratamientos
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Manicura
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Información</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Ubicaciones
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Citas
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Términos
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex justify-between items-center text-sm">
            <p>
              &copy; {new Date().getFullYear()} Salón. Todos los derechos
              reservados.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition">
                Instagram
              </a>
              <a href="#" className="hover:text-white transition">
                Facebook
              </a>
              <a href="#" className="hover:text-white transition">
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
