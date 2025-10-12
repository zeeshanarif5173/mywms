const { PrismaClient } = require('@prisma/client')
require('dotenv').config({ path: '.env.local' }) // Load .env.local

const prisma = new PrismaClient()

async function ensureDefaultBranch() {
  try {
    console.log('🔍 Checking for default branch...')

    // Check if branch with ID 1 exists
    const existingBranch = await prisma.branch.findUnique({
      where: { id: 1 }
    })

    if (existingBranch) {
      console.log('✅ Default branch already exists:', existingBranch.name)
      return
    }

    // Create default branch
    const defaultBranch = await prisma.branch.create({
      data: {
        id: 1,
        name: 'Main Branch',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        phone: '+1-555-0123',
        email: 'main@coworking.com',
        isActive: true
      }
    })

    console.log('✅ Created default branch:', defaultBranch.name)

  } catch (error) {
    console.error('❌ Error ensuring default branch:', error)
  } finally {
    await prisma.$disconnect()
  }
}

ensureDefaultBranch()
