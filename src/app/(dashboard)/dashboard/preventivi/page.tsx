import { FileText } from "lucide-react";

import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      title="Preventivi"
      description="Preventivazione professionale e stati."
      icon={FileText}
    />
  );
}
