import { Settings } from "lucide-react";

import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      title="Impostazioni"
      description="Configurazione fiscale, utenti e brand."
      icon={Settings}
    />
  );
}
