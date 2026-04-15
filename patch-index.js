import * as fs from 'fs';

const p = 'C:\\Users\\Ansh\\Desktop\\dev\\yesbossoxf\\openclaw-plugin-yesboss\\index.ts';
let c = fs.readFileSync(p, 'utf8');

c = c.replace('export default definePluginEntry({', 'const plugin = {');
c = c.replace(/}\);\s*$/, '};\n\nexport default plugin;\n');
c = c.replace('import { definePluginEntry, type AnyAgentTool } from "openclaw/plugin-sdk";', 'import type { AnyAgentTool } from "openclaw/plugin-sdk";');

fs.writeFileSync(p, c);
console.log('done');
