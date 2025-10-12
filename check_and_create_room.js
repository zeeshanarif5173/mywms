const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    // Check existing rooms
    const rooms = await prisma.meetingRoom.findMany()
    console.log('Existing rooms:', JSON.stringify(rooms, null, 2))
    
    if (rooms.length === 0) {
      // Create a test room
      const room = await prisma.meetingRoom.create({
        data: {
          name: 'Test Room E2E',
          capacity: 10,
          location: 'Test Floor',
          amenities: 'WiFi, Projector',
          isActive: true
        }
      })
      console.log('Created room:', JSON.stringify(room, null, 2))
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
