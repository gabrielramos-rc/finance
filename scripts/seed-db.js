#!/usr/bin/env node
/**
 * Script to seed database with categories
 * Loads environment variables from .env.local before running seed
 */

const { execSync } = require('child_process');
const { readFileSync, existsSync } = require('fs');
const { resolve } = require('path');

const envLocalPath = resolve(__dirname, '..', '.env.local');

console.log('📋 Loading environment from .env.local...');

if (!existsSync(envLocalPath)) {
  console.error('❌ Error: .env.local file not found');
  process.exit(1);
}

// Parse .env.local file
const envContent = readFileSync(envLocalPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) {
    return;
  }

  const match = trimmed.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    envVars[key] = value;
  }
});

// Set environment variables
Object.entries(envVars).forEach(([key, value]) => {
  process.env[key] = value;
});

// Verify required variables
if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
  console.error('❌ Error: DATABASE_URL or DIRECT_URL not found in .env.local');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('🌱 Seeding database with categories...\n');

// Run seed script
try {
  execSync('pnpm exec tsx prisma/seed.ts', {
    stdio: 'inherit',
    cwd: resolve(__dirname, '..'),
    env: process.env,
  });
  console.log('\n✅ Database seeded successfully!');
} catch (error) {
  console.error('\n❌ Failed to seed database');
  process.exit(1);
}

