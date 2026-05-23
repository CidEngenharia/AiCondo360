import { execSync } from 'child_process';

try {
  const diff = execSync('git diff -U5 src/pages/Assembleias.tsx', { encoding: 'utf8' });
  const lines = diff.split('\n');
  console.log(lines.slice(0, 100).join('\n'));
} catch (e) {
  console.error(e);
}
