import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const PACKAGES_FILE = path.join(DATA_DIR, 'packages.json')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

export interface Package {
  id: string
  name: string
  description: string
  type: 'daily' | 'weekly' | 'monthly' | 'yearly'
  price: number
  currency: string
  duration: number
  features: string[]
  limitations: string[]
  isActive: boolean
  branchIds: string[]
  createdAt: string
  updatedAt: string
}

export function getPersistentPackages(): Package[] {
  try {
    if (fs.existsSync(PACKAGES_FILE)) {
      const data = fs.readFileSync(PACKAGES_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading packages file:', error)
  }
  return []
}

export function savePersistentPackages(packages: Package[]): void {
  try {
    fs.writeFileSync(PACKAGES_FILE, JSON.stringify(packages, null, 2))
  } catch (error) {
    console.error('Error saving packages file:', error)
  }
}

export function getHybridPackages(): Package[] {
  try {
    return getPersistentPackages()
  } catch (error) {
    console.error('Error getting hybrid packages:', error)
    return []
  }
}
