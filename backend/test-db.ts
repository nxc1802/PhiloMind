import { PrismaClient } from '@prisma/client';

async function testConnection(url: string, name: string) {
  console.log(`Testing ${name}...`);
  console.log(`URL: ${url.replace(/:[^:@]+@/, ':***@')}`);
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url,
      },
    },
  });

  try {
    await prisma.$connect();
    console.log(`✅ Success for ${name}!`);
    const users = await prisma.user.findMany({ take: 1 });
    console.log(`Data count:`, users.length);
    await prisma.$disconnect();
    return true;
  } catch (error: any) {
    console.log(`❌ Failed for ${name}:`);
    console.log(error.message || error);
    try {
      await prisma.$disconnect();
    } catch {}
    return false;
  }
}

async function run() {
  const passwordEncoded = 'SmB%24t-ffsB7%2B3jz';
  const passwordRaw = 'SmB$t-ffsB7+3jz';
  
  // --- AWS-0 Tests ---
  // Test 1: Pooler port 6543 with encoded password
  await testConnection(
    `postgresql://postgres.piqwpmvfwrmvjxwcfeny:${passwordEncoded}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`,
    'Pooler aws-0 6543 (Encoded Password)'
  );

  // Test 2: Pooler port 5432 with encoded password
  await testConnection(
    `postgresql://postgres.piqwpmvfwrmvjxwcfeny:${passwordEncoded}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`,
    'Pooler aws-0 5432 (Encoded Password)'
  );

  // --- AWS-1 Tests ---
  // Test 3: Pooler port 6543 with encoded password
  await testConnection(
    `postgresql://postgres.piqwpmvfwrmvjxwcfeny:${passwordEncoded}@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`,
    'Pooler aws-1 6543 (Encoded Password)'
  );

  // Test 4: Pooler port 5432 with encoded password
  await testConnection(
    `postgresql://postgres.piqwpmvfwrmvjxwcfeny:${passwordEncoded}@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres`,
    'Pooler aws-1 5432 (Encoded Password)'
  );

  // Test 5: Pooler port 6543 with raw password
  await testConnection(
    `postgresql://postgres.piqwpmvfwrmvjxwcfeny:${passwordRaw}@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`,
    'Pooler aws-1 6543 (Raw Password)'
  );
}

run();
