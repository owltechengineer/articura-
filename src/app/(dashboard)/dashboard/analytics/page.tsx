import { BarChart3 } from "lucide-react";

import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      title="Analytics"
      description="Indicatori e andamenti nel tempo."
      icon={BarChart3}
    />
  );
}
