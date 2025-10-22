import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json')

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

export function getPersistentPayments(): any[] {
  ensureDataDirectory()
  try {
    if (fs.existsSync(PAYMENTS_FILE)) {
      const data = fs.readFileSync(PAYMENTS_FILE, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error reading payments file:', error)
    return []
  }
}

export function savePersistentPayments(payments: any[]): void {
  ensureDataDirectory()
  try {
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2), 'utf8')
  } catch (error) {
    console.error('Error saving payments file:', error)
  }
}

export function getHybridPayments(): any[] {
  const persistentPayments = getPersistentPayments()
  return persistentPayments
}
