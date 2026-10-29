// Points the production build at the API when it lives on another origin (e.g. Render: API_URL=https://api.example.com).
// Without API_URL the build keeps `apiUrl: ''` (API served from the same origin behind a reverse proxy).
import { readFileSync, writeFileSync } from 'node:fs';

const raw = process.env.API_URL?.trim();
if (!raw) process.exit(0);

const url = (raw.startsWith('http') ? raw : `https://${raw}`).replace(/\/+$/, '');
const file = new URL('../src/environments/environment.ts', import.meta.url);
const source = readFileSync(file, 'utf8');
const next = source.replace(/apiUrl: '[^']*'/, `apiUrl: '${url}'`);
if (next === source && !source.includes(`apiUrl: '${url}'`)) {
  console.error('set-api-url: apiUrl not found in environment.ts');
  process.exit(1);
}
writeFileSync(file, next);
console.log(`set-api-url: API at ${url}`);
