import { prisma } from './database'
import { 
  getCustomerById as getMockCustomerById,
  getCustomerByUserId as getMockCustomerByUserId,
  updateMockCustomer,
  getComplaintsByCustomerId as getMockComplaintsByCustomerId,
  createComplaint as createMockComplaint,
  updateComplaint as updateMockComplaint,
  getTimeEntriesByCustomerId as getMockTimeEntriesByCustomerId,
  getCurrentTimeEntry as getMockCurrentTimeEntry,
  checkIn as mockCheckIn,
  checkOut as mockCheckOut,
  getBookingsByCustomerId as getMockBookingsByCustomerId,
  createBooking as createMockBooking,
  cancelBooking as cancelMockBooking,
  getAllMeetingRooms as getMockMeetingRooms,
  getActiveMeetingRooms as getMockActiveMeetingRooms
} from './mock-data'

// Database connection status
let isDatabaseConnected = false

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$connect()
    isDatabaseConnected = true
    console.log('✅ Database connected successfully')
    return true
  } catch (error) {
    console.log('⚠️ Database not available, using mock data')
    isDatabaseConnected = false
    return false
  }
}

// Customer Service
export async function getCustomerById(id: string) {
  if (isDatabaseConnected) {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: parseInt(id) },
        include: {
          package: true,
          complaints: {
            include: {
              feedback: true
            }
          },
          contracts: true,
          timeEntries: true,
          bookings: {
            include: {
              room: true
            }
          }
        }
      })
      return customer
    } catch (error) {
      console.error('Database error, falling back to mock data:', error)
      return getMockCustomerById(id)
    }
  }
  return getMockCustomerById(id)
}

export async function getCustomerByUserId(userId: string) {
  if (isDatabaseConnected) {
    try {
      // Map user ID to customer ID (you might need to adjust this logic)
      const customer = await prisma.customer.findFirst({
        where: { 
          OR: [
            { id: parseInt(userId) },
            { email: { contains: userId } }
          ]
        },
        include: {
          package: true,
          complaints: {
            include: {
              feedback: true
            }
          },
          contracts: true,
          timeEntries: true,
          bookings: {
            include: {
              room: true
            }
          }
        }
      })
      return customer
    } catch (error) {
      console.error('Database error, falling back to mock data:', error)
      return getMockCustomerByUserId(userId)
    }
  }
  return getMockCustomerByUserId(userId)
}

export async function updateCustomer(id: string, updateData: any) {
  if (isDatabaseConnected) {
    try {
      const customer = await prisma.customer.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          package: true,
          complaints: {
            include: {
              feedback: true
            }
          },
          contracts: true,
          timeEntries: true,
          bookings: {
            include: {
              room: true
            }
          }
        }
      })
      return customer
    } catch (error) {
      console.error('Database error, falling back to mock data:', error)
      return updateMockCustomer(id, updateData)
    }
  }
  return updateMockCustomer(id, updateData)
}

// Complaints Service
export async function getComplaintsByCustomerId(customerId: string) {
  if (isDatabaseConnected) {
    try {
      const complaints = await prisma.complaint.findMany({
        where: { customerId: parseInt(customerId) },
        include: {
          feedback: true
        },
        orderBy: { createdAt: 'desc' }
      })
      return complaints
    } catch (error) {
      console.error('Database error, falling back to mock data:', error)
      return getMockComplaintsByCustomerId(customerId)
    }
  }
  return getMockComplaintsByCustomerId(customerId)
}

export async function createComplaint(customerId: string, title: string, description: string) {
  if (isDatabaseConnected) {
    try {
      const complaint = await prisma.complaint.create({
        data: {
          customerId: parseInt(customerId),
          title,
          description,
          status: 'Open'
        }
      })
      return complaint
    } catch (error) {
      console.error('Database error, falling back to mock data:', error)
      return createMockComplaint(customerId, '1', title, description)
    }
  }
  return createMockComplaint(customerId, '1', title, description)
}

export async function updateComplaint(complaintId: string, updates: any) {
  if (isDatabaseConnected) {
    try {
      const complaint = await prisma.complaint.update({
        where: { id: parseInt(complaintId) },
        data: updates
      })
      return complaint
    } catch (error) {
      console.error('Database error, falling back to mock data:', error)
      return updateMockComplaint(complaintId, updates)
    }
  }
  return updateMockComplaint(complaintId, updates)
}

// Time Tracking Service
export async function getTimeEntriesByCustomerId(customerId: string) {
  if (isDatabaseConnected) {
    try {
      const entries = await prisma.timeEntry.findMany({
        where: { customerId: parseInt(customerId) },
        orderBy: { createdAt: 'desc' }
      })
      return entries
    } catch (error) {
      console.error('Database error, falling back to mock data:', error)
      return getMockTimeEntriesByCustomerId(customerId)
    }
  }
  return getMockTimeEntriesByCustomerId(customerId)
}

export async function getCurrentTimeEntry(customerId: string) {
  if (isDatabaseConnected) {
    try {
      const entry = await prisma.timeEntry.findFirst({
        where: { 
          customerId: parseInt(customerId),
          status: 'Checked In'
        }
      })
      return entry
    } catch (error) {
      console.error('Database error, falling back to mock data:', error)
      return getMockCurrentTimeEntry(customerId)
    }
  }
  return getMockCurrentTimeEntry(customerId)
}

export async function checkIn(customerId: string, notes?: string) {
  if (isDatabaseConnected) {
    try {
      const entry = await prisma.timeEntry.create({
        data: {
          customerId: parseInt(customerId),
          checkInTime: new Date(),
          status: 'Checked In',
          notes: notes || '',
          date: new Date().toISOString().split('T')[0]
        }
      })
      return entry
    } catch (error) {
      console.error('Database error, falling back to mock data:', error)
      return mockCheckIn(customerId, notes)
    }
  }
  return mockCheckIn(customerId, notes)
}

export async function checkOut(customerId: string) {
  if (isDatabaseConnected) {
    try {
      const currentEntry = await prisma.timeEntry.findFirst({
        where: { 
          customerId: parseInt(customerId),
          status: 'Checked In'
        }
      })
      
      if (!currentEntry) return null
      
      const now = new Date()
      const duration = Math.floor((now.getTime() - currentEntry.checkInTime.getTime()) / (1000 * 60))
      
      const updatedEntry = await prisma.timeEntry.update({
        where: { id: currentEntry.id },
        data: {
          checkOutTime: now,
          duration,
          status: 'Checked Out'
        }
      })
      
      return updatedEntry
    } catch (error) {
      console.error('Database error, falling back to mock data:', error)
      return mockCheckOut(customerId)
    }
  }
  return mockCheckOut(customerId)
}

// Meeting Rooms Service
export async function getMeetingRooms() {
  if (isDatabaseConnected) {
    try {
      const rooms = await prisma.meetingRoom.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      })
      return rooms
    } catch (error) {
      console.error('Database error, falling back to mock data:', error)
      return getMockActiveMeetingRooms()
    }
  }
  return getMockActiveMeetingRooms()
}

export async function getBookingsByCustomerId(customerId: string) {
  if (isDatabaseConnected) {
    try {
      const bookings = await prisma.booking.findMany({
        where: { customerId: parseInt(customerId) },
        include: {
          room: true
        },
        orderBy: { createdAt: 'desc' }
      })
      return bookings
    } catch (error) {
      console.error('Database error, falling back to mock data:', error)
      return getMockBookingsByCustomerId(customerId)
    }
  }
  return getMockBookingsByCustomerId(customerId)
}

export async function createBooking(customerId: string, roomId: string, date: string, startTime: string, endTime: string, purpose: string) {
  if (isDatabaseConnected) {
    try {
      // Calculate duration
      const start = new Date(`2000-01-01T${startTime}:00`)
      const end = new Date(`2000-01-01T${endTime}:00`)
      const duration = (end.getTime() - start.getTime()) / (1000 * 60)
      
      const booking = await prisma.booking.create({
        data: {
          customerId: parseInt(customerId),
          roomId: parseInt(roomId),
          date,
          startTime,
          endTime,
          duration,
          purpose,
          status: 'Confirmed'
        },
        include: {
          room: true
        }
      })
      return booking
    } catch (error) {
      console.error('Database error, falling back to mock data:', error)
      return createMockBooking(customerId, '1', roomId, date, startTime, endTime, purpose)
    }
  }
  return createMockBooking(customerId, '1', roomId, date, startTime, endTime, purpose)
}

export async function cancelBooking(bookingId: string) {
  if (isDatabaseConnected) {
    try {
      const booking = await prisma.booking.update({
        where: { id: parseInt(bookingId) },
        data: { status: 'Cancelled' }
      })
      return booking
    } catch (error) {
      console.error('Database error, falling back to mock data:', error)
      return cancelMockBooking(bookingId)
    }
  }
  return cancelMockBooking(bookingId)
}

// Initialize database connection
export async function initializeDatabase() {
  await testConnection()
  if (isDatabaseConnected) {
    console.log('✅ Using real database')
  } else {
    console.log('⚠️ Using mock data (database not available)')
  }
}
