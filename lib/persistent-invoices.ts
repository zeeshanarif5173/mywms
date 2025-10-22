import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const INVOICES_FILE = path.join(DATA_DIR, 'invoices.json')

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

export function getPersistentInvoices(): any[] {
  ensureDataDirectory()
  try {
    if (fs.existsSync(INVOICES_FILE)) {
      const data = fs.readFileSync(INVOICES_FILE, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error reading invoices file:', error)
    return []
  }
}

export function savePersistentInvoices(invoices: any[]): void {
  ensureDataDirectory()
  try {
    fs.writeFileSync(INVOICES_FILE, JSON.stringify(invoices, null, 2), 'utf8')
  } catch (error) {
    console.error('Error saving invoices file:', error)
  }
}

export function getHybridInvoices(): any[] {
  const persistentInvoices = getPersistentInvoices()
  return persistentInvoices
}
