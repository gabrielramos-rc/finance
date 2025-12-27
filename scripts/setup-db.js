#!/usr/bin/env node
/**
 * Script to setup database by loading .env.local and running Prisma commands
 */

const { execSync } = require('child_process');
const { readFileSync, existsSync } = require('fs');
const { resolve } = require('path');

const envLocalPath = resolve(__dirname, '..', '.env.local');

console.log('📋 Loading environment from .env.local...');

if (!existsSync(envLocalPath)) {
  console.error('❌ Error: .env.local file not found');
  console.error('   Please create .env.local with DATABASE_URL and DIRECT_URL');
  process.exit(1);
}

// Parse .env.local file manually (simple parser)
const envContent = readFileSync(envLocalPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach((line) => {
  // Skip comments and empty lines
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) {
    return;
  }

  // Parse KEY=VALUE
  const match = trimmed.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    
    // Remove quotes if present
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
console.log('🚀 Pushing schema to database...\n');

// Verify DATABASE_URL is set
const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ Error: DATABASE_URL or DIRECT_URL not set after loading .env.local');
  process.exit(1);
}

console.log(`   Using: ${dbUrl.split('@')[1] ? '***@' + dbUrl.split('@')[1] : 'DATABASE_URL'}\n`);

// Run prisma db push with --url flag to pass DATABASE_URL directly
// Try DIRECT_URL first (for migrations), then DATABASE_URL (pooler) as fallback

// Try with DIRECT_URL first (recommended for schema operations)
if (process.env.DIRECT_URL) {
  console.log('   Trying direct connection (DIRECT_URL)...\n');
  try {
    const command = `pnpm prisma db push --accept-data-loss --url "${process.env.DIRECT_URL}"`;
    execSync(command, {
      stdio: 'inherit',
      cwd: resolve(__dirname, '..'),
      env: process.env,
    });
    console.log('\n✅ Schema pushed successfully!');
    process.exit(0);
  } catch (error) {
    console.log('\n   Direct connection failed, trying pooler connection...\n');
  }
}

// Fallback to DATABASE_URL (pooler) if DIRECT_URL failed or not available
if (process.env.DATABASE_URL && process.env.DATABASE_URL !== process.env.DIRECT_URL) {
  console.log('   Trying pooler connection (DATABASE_URL)...\n');
  try {
    const command = `pnpm prisma db push --accept-data-loss --url "${process.env.DATABASE_URL}"`;
    execSync(command, {
      stdio: 'inherit',
      cwd: resolve(__dirname, '..'),
      env: process.env,
    });
    console.log('\n✅ Schema pushed successfully!');
  } catch (error) {
    console.error('\n❌ Failed to push schema with both connection methods');
    console.error('\n   Possible issues:');
    console.error('   1. Database server is not accessible from this network');
    console.error('   2. Connection string format is incorrect');
    console.error('   3. Database credentials are invalid');
    console.error('   4. Supabase project might be paused or deleted');
    console.error('\n   Please verify your Supabase connection settings in .env.local');
    process.exit(1);
  }
} else {
  console.error('\n❌ Failed to push schema');
  console.error('   No valid database connection URL found');
  process.exit(1);
}

