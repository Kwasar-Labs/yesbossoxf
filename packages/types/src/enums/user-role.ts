export enum UserRole {
  /**
   * Hidden developer/system role. Full access. Never exposed to frontend or
   * general users. Used internally by Venus to decide tooling access.
   */
  SUPERADMIN = "superadmin",
  /**
   * Dr. Gurbir Singh Gill and designated org admins.
   * Full control: create/delete projects, assign, all task ops.
   */
  ADMIN = "admin",
  /**
   * Regular team members. Create + update own tasks. No destructive ops.
   */
  MEMBER = "member",
}
