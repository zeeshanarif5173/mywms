import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json')

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

export function getPersistentBookings(): any[] {
  ensureDataDirectory()
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = fs.readFileSync(BOOKINGS_FILE, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error reading bookings file:', error)
    return []
  }
}

export function savePersistentBookings(bookings: any[]): void {
  ensureDataDirectory()
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf8')
  } catch (error) {
    console.error('Error saving bookings file:', error)
  }
}

export function getHybridBookings(): any[] {
  const persistentBookings = getPersistentBookings()
  return persistentBookings
}
