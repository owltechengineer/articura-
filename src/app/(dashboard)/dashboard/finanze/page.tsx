import { Wallet } from "lucide-react";

import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      title="Finanze"
      description="Controllo economico interno (non fiscale)."
      icon={Wallet}
    />
  );
}
