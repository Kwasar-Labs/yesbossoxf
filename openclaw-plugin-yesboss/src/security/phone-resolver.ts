/**
 * Resolves a WhatsApp sender phone number (E.164) to a YesBoss user with role.
 * Results are cached in-memory for the process lifetime.
 */

import { callYesBossApi } from "../yesboss-client.js";

interface ResolvedUser {
  userId: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
}

const cache = new Map<string, ResolvedUser>();

export async function resolveSender(
  senderE164: string,
  pluginConfig?: { apiUrl?: string; apiKey?: string },
): Promise<ResolvedUser | null> {
  const cached = cache.get(senderE164);
  if (cached) return cached;

  try {
    const result = await callYesBossApi(
      "GET",
      `/auth/phone-mappings/${encodeURIComponent(senderE164)}`,
      undefined,
      pluginConfig,
    );

    const mapping = (result as any).data?.mapping;
    const user = (result as any).data?.user;

    if (!user) return null;

    const resolved: ResolvedUser = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    cache.set(senderE164, resolved);
    return resolved;
  } catch {
    return null;
  }
}

export function clearCache(): void {
  cache.clear();
}
