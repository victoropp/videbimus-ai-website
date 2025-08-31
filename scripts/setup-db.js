#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Setting up Vidibemus AI Database...\n')

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env')
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!')
  console.log('📋 Please copy .env.example to .env and configure your database settings.')
  console.log('📋 Run: cp .env.example .env')
  process.exit(1)
}

// Check if DATABASE_URL is configured
const envContent = fs.readFileSync(envPath, 'utf-8')
if (!envContent.includes('DATABASE_URL=') || envContent.includes('postgresql://username:password@localhost')) {
  console.log('⚠️  DATABASE_URL not properly configured in .env file')
  console.log('📋 Please update your DATABASE_URL with actual database credentials.')
  console.log('📋 Example: DATABASE_URL="postgresql://user:password@localhost:5432/vidibemus_ai_db"')
  
  const shouldContinue = process.argv.includes('--force')
  if (!shouldContinue) {
    console.log('📋 Use --force flag to continue anyway.')
    process.exit(1)
  }
}

try {
  console.log('📦 Step 1: Installing dependencies...')
  execSync('npm install', { stdio: 'inherit' })
  console.log('✅ Dependencies installed\n')

  console.log('🔧 Step 2: Generating Prisma client...')
  execSync('npm run db:generate', { stdio: 'inherit' })
  console.log('✅ Prisma client generated\n')

  console.log('📊 Step 3: Pushing database schema...')
  execSync('npm run db:push', { stdio: 'inherit' })
  console.log('✅ Database schema created\n')

  console.log('🌱 Step 4: Seeding database with sample data...')
  execSync('npm run db:seed', { stdio: 'inherit' })
  console.log('✅ Database seeded\n')

  console.log('🎉 Database setup completed successfully!\n')
  console.log('📋 Default users created:')
  console.log('   👤 Admin: admin@vidibemus.ai / AdminPass123!')
  console.log('   👨‍💼 Consultant: consultant@vidibemus.ai / ConsultantPass123!')
  console.log('   👥 Clients: client1@example.com, client2@example.com, client3@example.com / ClientPass123!')
  console.log('\n🚀 You can now start the development server with: npm run dev')
  console.log('🔍 View your database with: npm run db:studio')

} catch (error) {
  console.error('❌ Setup failed:', error.message)
  console.log('\n🔧 Troubleshooting:')
  console.log('   1. Make sure PostgreSQL is running')
  console.log('   2. Check your DATABASE_URL in .env file')
  console.log('   3. Ensure the database exists and is accessible')
  console.log('   4. Verify network connectivity to database')
  process.exit(1)
}