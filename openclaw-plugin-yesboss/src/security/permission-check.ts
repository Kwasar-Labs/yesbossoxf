/**
 * Permission checks for YesBoss / Venus operations.
 *
 * Hierarchy (highest → lowest):
 *   superadmin — hidden dev role, never shown to front end
 *   admin      — Dr. Gurbir Singh Gill + designated admins
 *   member     — regular team members
 */

interface UserLike {
  role: string;
  name?: string;
}

export function requireRegisteredUser(user: UserLike | null): asserts user is UserLike {
  if (!user) {
    throw new Error(
      "Hmm, your number isn't registered 🤔 Ask Dr. Gill to add you first!",
    );
  }
}

/** superadmin OR admin pass */
export function requireAdmin(user: UserLike | null): asserts user is UserLike {
  requireRegisteredUser(user);
  if (user.role !== "admin" && user.role !== "superadmin") {
    throw new Error("🚫 Admin access only. Ping Dr. Gill if you think that's wrong!");
  }
}

/** Only superadmin (hidden dev role) */
export function requireSuperAdmin(user: UserLike | null): asserts user is UserLike {
  requireRegisteredUser(user);
  if (user.role !== "superadmin") {
    throw new Error("Access denied.");
  }
}

export function isAdmin(role: string): boolean {
  return role === "admin" || role === "superadmin";
}

export function isSuperAdmin(role: string): boolean {
  return role === "superadmin";
}

/** Never expose superadmin role string to user-facing messages. */
export function publicRole(role: string): string {
  if (role === "superadmin") return "admin";
  return role;
}
