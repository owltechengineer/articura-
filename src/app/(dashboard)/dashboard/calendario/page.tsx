import { Calendar } from "lucide-react";

import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      title="Calendario"
      description="Pianificazione interna del lavoro."
      icon={Calendar}
    />
  );
}
