import type { Timestamps } from "./common.js";

export interface PhoneUserMapping extends Timestamps {
  _id: string;
  phoneE164: string;
  userId: string;
  organizationId: string;
  verifiedAt: Date;
}

export interface PhoneMappingCreateInput {
  phoneE164: string;
  userId: string;
  organizationId: string;
}
