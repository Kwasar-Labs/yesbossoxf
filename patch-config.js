import * as fs from 'fs';
import * as path from 'path';

const configPath = path.join(process.env.USERPROFILE, '.openclaw', 'openclaw.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// 1. Ensure plugin is enabled with config
config.plugins = config.plugins || { entries: {} };
config.plugins.entries.yesboss = {
  enabled: true,
  config: {
    apiUrl: 'http://localhost:3000/api',
    apiKey: 'dev-api-key'
  }
};

// 2. Ensure agents.list exists and yesboss is added
config.agents = config.agents || {};
config.agents.list = config.agents.list || [];

// remove if already there to prevent duplicates
config.agents.list = config.agents.list.filter(a => a.id !== 'yesboss-agent');
config.agents.list.push({
  id: 'yesboss-agent',
  name: 'YesBoss',
  default: false,
  skills: [
    'yesboss-task-management',
    'yesboss-project-management',
    'yesboss-admin'
  ],
  identity: {
    name: 'YesBoss Assistant',
    description: 'You are the YesBoss workforce management assistant.\nYou help users manage tasks and projects through WhatsApp.\nAlways be concise since this is a messaging interface.\nUse bullet points for lists. Keep responses under 200 words.\nWhen in doubt about a user\'s identity, look them up first.'
  }
});

// 3. Ensure bindings
config.bindings = config.bindings || [];
config.bindings = config.bindings.filter(b => b.agentId !== 'yesboss-agent');
config.bindings.push({
  agentId: 'yesboss-agent',
  match: {
    channel: 'whatsapp'
  }
});

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('Saved openclaw.json');
