import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json')

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

export function getPersistentTasks(): any[] {
  ensureDataDirectory()
  try {
    const data = fs.readFileSync(TASKS_FILE, 'utf8')
    const tasks = JSON.parse(data)
    return tasks
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      // File does not exist, return empty array
      return []
    }
    console.error('Error reading tasks file:', error)
    return []
  }
}

export function savePersistentTasks(tasks: any[]): void {
  ensureDataDirectory()
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8')
  } catch (error) {
    console.error('Error saving tasks file:', error)
  }
}

export function getHybridTasks(): any[] {
  const persistentTasks = getPersistentTasks()
  return persistentTasks
}
