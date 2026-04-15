import * as fs from 'fs';

const p = 'C:\\Users\\Ansh\\Desktop\\dev\\yesbossoxf\\openclaw-plugin-yesboss\\src\\config.ts';
let c = fs.readFileSync(p, 'utf8');

c = `/**
 * Resolves YesBoss API configuration from plugin config or environment variables.
 */

export const DEFAULT_YESBOSS_API_URL = "http://127.0.0.1:3000/api";

export function resolveApiUrl(pluginConfig?: { apiUrl?: string }): string {
  return pluginConfig?.apiUrl || process.env.YESBOSS_API_URL || DEFAULT_YESBOSS_API_URL;
}

export function resolveApiKey(pluginConfig?: { apiKey?: string }): string {
  const key = pluginConfig?.apiKey || process.env.YESBOSS_API_KEY || 'dev-api-key';
  return key;
}
`;

fs.writeFileSync(p, c);
console.log('done');
