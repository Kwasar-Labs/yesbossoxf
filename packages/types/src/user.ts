import type { Timestamps } from "./common.js";
import type { UserRole } from "./enums/index.js";

export interface User extends Timestamps {
  _id: string;
  email: string;
  name: string;
  phoneE164?: string;
  role: UserRole;
  organizationId: string;
  teamIds: string[];
  isActive: boolean;
}

export interface UserCreateInput {
  email: string;
  name: string;
  password: string;
  phoneE164?: string;
  role?: UserRole;
  organizationId: string;
  teamIds?: string[];
}

export interface UserUpdateInput {
  name?: string;
  phoneE164?: string;
  role?: UserRole;
  teamIds?: string[];
  isActive?: boolean;
}
