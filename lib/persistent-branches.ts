import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const BRANCHES_FILE = path.join(DATA_DIR, 'branches.json')

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

export function getPersistentBranches(): any[] {
  ensureDataDirectory()
  try {
    if (fs.existsSync(BRANCHES_FILE)) {
      const data = fs.readFileSync(BRANCHES_FILE, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error reading branches file:', error)
    return []
  }
}

export function savePersistentBranches(branches: any[]): void {
  ensureDataDirectory()
  try {
    fs.writeFileSync(BRANCHES_FILE, JSON.stringify(branches, null, 2), 'utf8')
  } catch (error) {
    console.error('Error saving branches file:', error)
  }
}

export function getHybridBranches(): any[] {
  const persistentBranches = getPersistentBranches()
  return persistentBranches
}
