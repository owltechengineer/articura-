import { EmptyState } from "@/components/ui/empty-state";
import type { LucideIcon } from "lucide-react";

type ModulePlaceholderProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function ModulePlaceholder({
  title,
  description,
  icon,
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-foreground-muted">{description}</p>
      </div>
      <EmptyState
        icon={icon}
        title="Modulo pronto per i dati reali"
        description="Nessun record fittizio. Quando collegherai Supabase e creerai il primo elemento, questa sezione si popolerà automaticamente."
      />
    </div>
  );
}
