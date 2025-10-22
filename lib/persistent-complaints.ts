import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const COMPLAINTS_FILE = path.join(DATA_DIR, 'complaints.json')

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

export function getPersistentComplaints(): any[] {
  ensureDataDirectory()
  try {
    if (fs.existsSync(COMPLAINTS_FILE)) {
      const data = fs.readFileSync(COMPLAINTS_FILE, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error reading complaints file:', error)
    return []
  }
}

export function savePersistentComplaints(complaints: any[]): void {
  ensureDataDirectory()
  try {
    fs.writeFileSync(COMPLAINTS_FILE, JSON.stringify(complaints, null, 2), 'utf8')
  } catch (error) {
    console.error('Error saving complaints file:', error)
  }
}

export function getHybridComplaints(): any[] {
  const persistentComplaints = getPersistentComplaints()
  return persistentComplaints
}
