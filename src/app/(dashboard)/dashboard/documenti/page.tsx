import { Files } from "lucide-react";

import { ModulePlaceholder } from "@/components/dashboard/module-placeholder";

export default function Page() {
  return (
    <ModulePlaceholder
      title="Documenti"
      description="Repository privato su Supabase Storage."
      icon={Files}
    />
  );
}
