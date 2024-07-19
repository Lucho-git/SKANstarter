import { execSync } from 'child_process';

const version = execSync('git rev-parse --short HEAD').toString().trim();

console.log(`PUBLIC_APP_VERSION=${version}`);
