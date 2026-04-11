/**
 * Permission checks for YesBoss operations.
 */

interface UserLike {
  role: string;
}

export function requireRegisteredUser(user: UserLike | null): asserts user is UserLike {
  if (!user) {
    throw new Error(
      "Your phone number is not registered in YesBoss. Ask an admin to add your number.",
    );
  }
}

export function requireAdmin(user: UserLike | null): asserts user is UserLike & { role: "admin" } {
  requireRegisteredUser(user);
  if (user.role !== "admin") {
    throw new Error("This operation requires admin access.");
  }
}
