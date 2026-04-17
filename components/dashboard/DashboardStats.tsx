import { Card } from "@/components/ui/card";

export function DashboardStats() {
  return (
    <div className="space-y-6">
      {/* Top Servicios */}
      <Card className="bg-white border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 bg-linear-to-r from-slate-50 to-white">
          <h3 className="text-base font-semibold text-slate-900">
            Servicios Populares
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground">
                Corte cabello
              </p>
              <p className="text-sm text-muted-foreground">8</p>
            </div>
            <div className="bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-linear-to-r from-blue-500 to-blue-600 h-1.5 rounded-full"
                style={{ width: "100%" }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground">Manicura</p>
              <p className="text-sm text-muted-foreground">6</p>
            </div>
            <div className="bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-linear-to-r from-purple-500 to-purple-600 h-1.5 rounded-full"
                style={{ width: "75%" }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground">Pedicura</p>
              <p className="text-sm text-muted-foreground">4</p>
            </div>
            <div className="bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-linear-to-r from-pink-500 to-pink-600 h-1.5 rounded-full"
                style={{ width: "50%" }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Próximas Citas */}
      <Card className="bg-background border-border overflow-hidden">
        <div className="border-b border-border px-6 py-4 bg-linear-to-r from-muted/50 to-background">
          <h3 className="text-base font-semibold text-foreground">
            Próximas Citas
          </h3>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-start gap-3 pb-3 border-b border-border">
            <div className="w-2 h-2 rounded-full bg-muted mt-1.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                14:00 - Ana Martínez
              </p>
              <p className="text-xs text-muted-foreground">Facial</p>
            </div>
          </div>
          <div className="flex items-start gap-3 pb-3 border-b border-border">
            <div className="w-2 h-2 rounded-full bg-muted mt-1.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                15:30 - Pablo Ruiz
              </p>
              <p className="text-xs text-muted-foreground">Corte + Barba</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-muted mt-1.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                16:00 - Sandra López
              </p>
              <p className="text-xs text-muted-foreground">Coloración</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
