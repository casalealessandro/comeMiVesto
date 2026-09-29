import { writeFileSync } from 'node:fs';

const rawCommit = process.env.GIT_COMMIT_SHA ?? 'local';
const gitCommit = /^[0-9a-f]{7,40}$/i.test(rawCommit) ? rawCommit : 'local';

writeFileSync(
  new URL('../src/environments/build-info.ts', import.meta.url),
  `// Generated for the web build; do not add secrets to this file.\nexport const buildInfo = {\n  gitCommit: '${gitCommit}',\n};\n`,
);
