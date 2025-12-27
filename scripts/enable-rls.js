#!/usr/bin/env node
/**
 * Script to enable Row Level Security (RLS) on all tables
 * Loads environment variables from .env.local and executes the RLS SQL file
 */

const { execSync } = require('child_process');
const { readFileSync, existsSync } = require('fs');
const { resolve } = require('path');

const envLocalPath = resolve(__dirname, '..', '.env.local');
const sqlFilePath = resolve(__dirname, '..', 'prisma', 'migrations', 'enable-rls.sql');

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
const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ Error: DATABASE_URL or DIRECT_URL not found in .env.local');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('📄 Reading RLS SQL file...\n');

if (!existsSync(sqlFilePath)) {
  console.error(`❌ Error: SQL file not found at ${sqlFilePath}`);
  process.exit(1);
}

const sqlContent = readFileSync(sqlFilePath, 'utf-8');

console.log('🚀 Executing RLS policies...\n');
console.log('   This will enable Row Level Security on all tables.');
console.log('   Users will only be able to access their own data.\n');

// Use psql to execute the SQL file
// Extract connection details from DATABASE_URL
try {
  // Parse the connection string
  const url = new URL(dbUrl.replace(/^postgresql:\/\//, 'http://'));
  const user = url.username || 'postgres';
  const password = url.password || '';
  const host = url.hostname;
  const port = url.port || '5432';
  const database = url.pathname?.slice(1) || 'postgres';

  // Use PGPASSWORD environment variable for password
  const env = {
    ...process.env,
    PGPASSWORD: password,
  };

  // Execute SQL using psql
  const command = `psql -h ${host} -p ${port} -U ${user} -d ${database} -f "${sqlFilePath}"`;
  
  console.log(`   Connecting to: ${host}:${port}/${database}\n`);
  
  execSync(command, {
    stdio: 'inherit',
    env: env,
  });

  console.log('\n✅ RLS policies enabled successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Verify policies in Supabase Dashboard → Authentication → Policies');
  console.log('   2. Test with a logged-in user to ensure they can only see their own data');
  console.log('   3. Ensure User.id matches Supabase auth.users.id when creating users');
  
} catch (error) {
  console.error('\n❌ Failed to execute RLS SQL');
  console.error('\n   Alternative: Run the SQL manually in Supabase SQL Editor');
  console.error(`   File location: ${sqlFilePath}`);
  console.error('\n   Or use psql directly:');
  console.error(`   psql "${dbUrl}" -f "${sqlFilePath}"`);
  process.exit(1);
}


