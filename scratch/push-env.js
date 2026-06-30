const { execSync } = require('child_process');
const fs = require('fs');

const envs = {
  DATABASE_URL: "postgresql://postgres.jkgybkomemryharpjoze:Gusta0110%40%40@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true",
  DIRECT_URL: "postgresql://postgres.jkgybkomemryharpjoze:Gusta0110%40%40@aws-1-us-west-2.pooler.supabase.com:5432/postgres",
  NEXTAUTH_SECRET: "super-secret-barber-key"
};

const environments = ['production', 'preview', 'development'];

for (const [key, value] of Object.entries(envs)) {
  for (const env of environments) {
    try {
      console.log(`Setting ${key} for ${env}...`);
      // Use npx vercel env rm first to avoid conflict if it exists
      try {
        execSync(`npx vercel env rm ${key} ${env} -y`, { stdio: 'ignore' });
      } catch(e) {} // ignore if it doesn't exist

      // Add the new variable
      execSync(`npx vercel env add ${key} ${env}`, {
        input: value,
        stdio: ['pipe', 'ignore', 'ignore']
      });
      console.log(`Success: ${key} added to ${env}`);
    } catch (e) {
      console.error(`Failed to add ${key} to ${env}`);
    }
  }
}
