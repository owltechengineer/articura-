"use client";

import { signOutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button variant="outline" size="sm" type="submit">
        Esci
      </Button>
    </form>
  );
}
