// Points the production build at the API when it lives on another origin (e.g. Render: API_URL=https://api.example.com).
// Without API_URL the build keeps `apiUrl: ''` (same origin), which only works when a proxy keeps API and page paths apart.
import { readFileSync, writeFileSync } from 'node:fs';

const raw = process.env.API_URL?.trim();
if (!raw) process.exit(0);

const url = (raw.startsWith('http') ? raw : `https://${raw}`).replace(/\/+$/, '');
const file = new URL('../src/environments/environment.ts', import.meta.url);
const source = readFileSync(file, 'utf8');
// Live updates through the API's own address (Reverb behind it on /app/, see the server's Dockerfile).
const reverbKey = process.env.REVERB_KEY?.trim() || 'e-clinic-live';
const reverb = `{ key: '${reverbKey}', host: '${new URL(url).hostname}', port: 443, scheme: 'https' }`;
const next = source
  .replace(/apiUrl: '[^']*'/, `apiUrl: '${url}'`)
  .replace(/reverb: null as ReverbConfig \| null/, `reverb: ${reverb} as ReverbConfig | null`);
if (next === source && !source.includes(`apiUrl: '${url}'`)) {
  console.error('set-api-url: apiUrl not found in environment.ts');
  process.exit(1);
}
writeFileSync(file, next);
console.log(`set-api-url: API at ${url}, live updates at wss://${new URL(url).hostname}/app`);
