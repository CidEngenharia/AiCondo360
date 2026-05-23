import { execSync } from 'child_process';

try {
  const diff = execSync('git diff -U10 src/pages/Assembleias.tsx', { encoding: 'utf8' });
  console.log(diff);
} catch (e) {
  console.error(e);
}
