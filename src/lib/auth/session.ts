import "server-only";

import { redirect } from "next/navigation";

import type { UserRole } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Permission } from "@/lib/auth/permissions";
import { hasPermission } from "@/lib/auth/permissions";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  avatarUrl: string | null;
  isActive: boolean;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, avatar_url, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) {
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    avatarUrl: profile.avatar_url,
    isActive: profile.is_active,
  };
}

export async function requireUser(
  permission?: Permission,
): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (permission && !hasPermission(user.role, permission)) {
    redirect("/dashboard");
  }

  return user;
}
