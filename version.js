import { execSync } from 'child_process';

// Manual base number - update this when you want to increment the major version
const BASE_VERSION = 1;

// Get the number of commits in the current branch
const commitCount = parseInt(execSync('git rev-list --count HEAD').toString().trim());

// Get the latest commit hash
const gitHash = execSync('git rev-parse HEAD').toString().trim();

// Convert the hash to a numeric value
const numericHash = parseInt(gitHash.substring(0, 8), 16);

// Combine all parts
const version = `${BASE_VERSION}.${commitCount}.${numericHash % 10000}`;

console.log(`PUBLIC_APP_VERSION=${version}`);
