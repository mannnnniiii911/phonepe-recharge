// Pre-build guard (runs automatically via the "prebuild" npm script).
//
// This project is a static Vite SPA on Vercel. All /api/* traffic is proxied to the
// Render backend through vercel.json rewrites. This guard fails the build ON VERCEL if:
//   1. an api/ directory exists (Vercel would turn every file in it into a Serverless
//      Function, which is what caused: 'A Serverless Function has an invalid name'), or
//   2. vercel.json has no /api rewrite to an https:// backend, or
//   3. the rewrite still contains the YOUR-RENDER-SERVICE placeholder.
// Locally (no VERCEL env var) the same problems are printed as warnings only.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const onVercel = Boolean(process.env.VERCEL);
const problems = [];

if (fs.existsSync(path.join(root, 'api'))) {
  problems.push(
    'An api/ directory exists. Vercel would build its files as Serverless Functions. ' +
      'The backend runs on Render; remove api/.'
  );
}

let config;
try {
  config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
} catch (err) {
  problems.push(`vercel.json could not be read/parsed: ${err.message}`);
}

if (config) {
  const apiRewrite = (config.rewrites || []).find(
    (r) => typeof r.source === 'string' && r.source.startsWith('/api')
  );
  if (!apiRewrite) {
    problems.push('vercel.json has no rewrite whose source starts with /api (API proxy missing).');
  } else if (!/^https:\/\//.test(apiRewrite.destination || '')) {
    problems.push(`The /api rewrite destination must start with https:// (found: ${apiRewrite.destination}).`);
  } else if (/YOUR-RENDER-SERVICE/i.test(apiRewrite.destination)) {
    problems.push(
      'vercel.json still contains the YOUR-RENDER-SERVICE placeholder. ' +
        'Replace it with your Render service URL (e.g. https://my-backend.onrender.com).'
    );
  }
}

if (problems.length === 0) {
  console.log('[check-vercel-config] OK');
} else {
  const tag = onVercel ? 'ERROR' : 'WARNING (not enforced outside Vercel)';
  console.error(`[check-vercel-config] ${tag}`);
  for (const p of problems) console.error(`  - ${p}`);
  if (onVercel) process.exit(1);
}
