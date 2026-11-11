import { Target } from "lucide-react";

import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      title="CRM"
      description="Pipeline commerciale e opportunità."
      icon={Target}
    />
  );
}
