import { CheckSquare } from "lucide-react";

import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      title="Attività"
      description="Task operative con priorità e scadenze."
      icon={CheckSquare}
    />
  );
}
