"use server";

import { redirect } from "next/navigation";

import { loginSchema, resetPasswordSchema } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/constants";

export type AuthActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Controlla i campi e riprova.",
    };
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      error:
        "Supabase non è configurato. Imposta le variabili in .env.local e riprova.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Credenziali non valide o account non autorizzato." };
  }

  const next = String(formData.get("next") || "/dashboard");
  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function requestPasswordResetAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Inserisci un'email valida.",
    };
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      error: "Supabase non è configurato.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${SITE_URL}/login`,
  });

  if (error) {
    return { error: "Impossibile inviare l'email di reset." };
  }

  return {
    success:
      "Se l'account esiste, riceverai un'email con le istruzioni per reimpostare la password.",
  };
}

export async function signOutAction() {
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
