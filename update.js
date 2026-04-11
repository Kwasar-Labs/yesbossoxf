const fs = require('fs');
let code = fs.readFileSync('apps/workforce/src/database/task-repository.ts', 'utf8');

code = code.replace('recurrenceRule?: string;', 'recurrenceRule?: string;\n  activity?: any[];\n  comments?: any[];\n  subtasks?: any[];');

code = code.replace('followUpDate?: string | null;\n}):', 'followUpDate?: string | null;\n  activity?: any[];\n  comments?: any[];\n  subtasks?: any[];\n}):');

const targetStr = 'await getCollection().updateOne({ _id: new ObjectId(id) }, { 
const fs = require('fs');
let code = fs.readFileSync('apps/workforce/src/database/task-repository.ts', 'utf8');

// modify TaskDocument
code = code.replace('recurrenceRule?: string;', 'recurrenceRule?: string;\\n  activity?: any[];\\n  comments?: any[];\\n  subtasks?: any[];');

// modify updateTask input
code = code.replace(/followUpDate\\?: string \\| null;\\n}\\):/, 'followUpDate?: string | null;\\n  activity?: any[];\\n  comments?: any[];\\n  subtasks?: any[];\\n}):');

// modify updateTask logic
const updateLogic = \
  if (input.activity !== undefined) update.activity = input.activity;
  if (input.comments !== undefined) update.comments = input.comments;
  if (input.subtasks !== undefined) update.subtasks = input.subtasks;
  await getCollection().updateOne({ _id: new ObjectId(id) }, { \$set: update });
\;
code = code.replace('await getCollection().updateOne({ _id: new ObjectId(id) }, { \\\$set: update });', updateLogic);

fs.writeFileSync('apps/workforce/src/database/task-repository.ts', code);
console.log('Modified repo');
set: update });';
const newStr = '  if (input.activity !== undefined) update.activity = input.activity;\n  if (input.comments !== undefined) update.comments = input.comments;\n  if (input.subtasks !== undefined) update.subtasks = input.subtasks;\n  ' + targetStr;

code = code.replace(targetStr, newStr);

fs.writeFileSync('apps/workforce/src/database/task-repository.ts', code);
console.log('Modified repo');
