import { execSync } from 'child_process';

// Manual base number - update this when you want to increment the major version
const BASE_VERSION = 1;

// Get the number of commits in the current branch
const commitCount = parseInt(execSync('git rev-list --count HEAD').toString().trim());

// Get the latest short commit hash
const gitShortHash = execSync('git rev-parse --short HEAD').toString().trim();

// Combine all parts
const version = `${BASE_VERSION}.${commitCount}.${gitShortHash}`;

console.log(`PUBLIC_APP_VERSION=${version}`);
