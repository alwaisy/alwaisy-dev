import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const wranglerJsonPath = resolve(process.cwd(), 'dist/client/wrangler.json');

if (existsSync(wranglerJsonPath)) {
    const config = JSON.parse(readFileSync(wranglerJsonPath, 'utf-8'));
    config.main = '../../worker/index.ts';
    writeFileSync(wranglerJsonPath, JSON.stringify(config, null, 2));
    console.log('[inject-worker] Successfully attached worker/index.ts to dist/client/wrangler.json');
} else {
    console.error('[inject-worker] dist/client/wrangler.json not found');
    process.exit(1);
}
