import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const CONTRACTS_FILE = path.join(DATA_DIR, 'contracts.json')

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

export function getPersistentContracts(): any[] {
  ensureDataDirectory()
  try {
    if (fs.existsSync(CONTRACTS_FILE)) {
      const data = fs.readFileSync(CONTRACTS_FILE, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error reading contracts file:', error)
    return []
  }
}

export function savePersistentContracts(contracts: any[]): void {
  ensureDataDirectory()
  try {
    fs.writeFileSync(CONTRACTS_FILE, JSON.stringify(contracts, null, 2), 'utf8')
  } catch (error) {
    console.error('Error saving contracts file:', error)
  }
}

export function getHybridContracts(): any[] {
  const persistentContracts = getPersistentContracts()
  return persistentContracts
}
