interface DashboardKPIsProps {
  pendingAppointments: number;
  newClients: number;
  revenueToday: number;
  revenueDiff: number;
  occupancyPercentage: number;
  isLoading: boolean;
}

export function DashboardKPIs({
  pendingAppointments,
  newClients,
  revenueToday,
  revenueDiff,
  occupancyPercentage,
  isLoading,
}: DashboardKPIsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {/* Citas Pendientes */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">
              Citas Pendientes
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {isLoading ? "..." : pendingAppointments}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-4">
          {isLoading ? "..." : "Citas para hoy"}
        </p>
      </div>

      {/* Clientes Nuevos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">
              Clientes Nuevos
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {isLoading ? "..." : newClients}
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-4">Esta semana</p>
      </div>

      {/* Ingresos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">
              Ingresos Hoy
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {isLoading ? "..." : `$${revenueToday.toFixed(2)}`}
            </p>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-amber-600"
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
        </div>
        <p className="text-xs text-slate-500 mt-4">
          {isLoading
            ? "..."
            : `${revenueDiff >= 0 ? "+" : ""}$${revenueDiff.toFixed(2)} vs ayer`}
        </p>
      </div>

      {/* Ocupación */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">
              Ocupación
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {isLoading ? "..." : `${occupancyPercentage}%`}
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        </div>
        <div className="mt-4 bg-slate-100 rounded-full h-1.5">
          <div
            className="bg-linear-to-r from-purple-500 to-purple-600 h-1.5 rounded-full"
            style={{ width: `${occupancyPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
