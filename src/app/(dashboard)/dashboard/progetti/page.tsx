import { FolderKanban } from "lucide-react";

import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      title="Progetti"
      description="Ciclo di sviluppo software e milestone."
      icon={FolderKanban}
    />
  );
}
