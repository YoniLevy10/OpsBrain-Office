import { Card, SectionHeading } from "@/components/ui/Primitives";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Sun, Moon } from "lucide-react";

export function ThemeSettingsPanel() {
  return (
    <Card className="p-5">
      <SectionHeading title="מצב תצוגה" subtitle="בהיר — רקע לבן · כהה — כחול/שחור עם כפתורים צבעוניים" />
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 text-[13px] text-text-secondary">
          <div className="flex gap-2 shrink-0">
            <span className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center shadow-sm">
              <Sun className="w-4 h-4 text-blue" />
            </span>
            <span className="w-9 h-9 rounded-xl bg-[#0E1219] border border-[#2A3444] flex items-center justify-center">
              <Moon className="w-4 h-4 text-emerald" />
            </span>
          </div>
          <p className="leading-relaxed pt-0.5">
            הבחירה נשמרת אוטומטית במכשיר. במצב בהיר הרקע לבן נקי; במצב כהה נשמר העיצוב הקיים עם גוון כחול-שחור.
          </p>
        </div>
        <ThemeToggle variant="pill" />
      </div>
    </Card>
  );
}
