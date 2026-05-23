import { execSync } from 'child_process';

try {
  const diff = execSync('git diff src/pages/Assembleias.tsx', { encoding: 'utf8' });
  const lines = diff.split('\n');
  console.log("Diff line count:", lines.length);
  // print lines that contain currentCondoId or condoId
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('currentCondoId') || lines[i].includes('condoId')) {
      console.log(`Line ${i}:`, lines[i]);
    }
  }
} catch (e) {
  console.error(e);
}
