import type { UserRole } from "@/lib/constants";

export type Permission =
  | "dashboard:access"
  | "crm:read"
  | "crm:write"
  | "clients:read"
  | "clients:write"
  | "projects:read"
  | "projects:write"
  | "quotes:read"
  | "quotes:write"
  | "finance:read"
  | "finance:write"
  | "documents:read"
  | "documents:write"
  | "settings:read"
  | "settings:write"
  | "users:manage"
  | "audit:read";

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  admin: [
    "dashboard:access",
    "crm:read",
    "crm:write",
    "clients:read",
    "clients:write",
    "projects:read",
    "projects:write",
    "quotes:read",
    "quotes:write",
    "finance:read",
    "finance:write",
    "documents:read",
    "documents:write",
    "settings:read",
    "settings:write",
    "users:manage",
    "audit:read",
  ],
  collaborator: [
    "dashboard:access",
    "crm:read",
    "crm:write",
    "clients:read",
    "clients:write",
    "projects:read",
    "projects:write",
    "quotes:read",
    "quotes:write",
    "documents:read",
    "documents:write",
    // No finance write, settings write, or user management
    "finance:read",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function requirePermission(
  role: UserRole,
  permission: Permission,
): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Forbidden: missing permission ${permission}`);
  }
}
