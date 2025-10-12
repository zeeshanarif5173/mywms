// Utility functions for generating unique IDs

/**
 * Generate a random 8-digit number as string
 */
export function generate8DigitId(): string {
  const min = 10000000 // 8 digits starting from 10000000
  const max = 99999999 // 8 digits ending at 99999999
  return Math.floor(Math.random() * (max - min + 1) + min).toString()
}

/**
 * Generate a unique Package ID
 * Format: PKG-XXXXXXXX (8 digits)
 */
export function generatePackageId(): string {
  return `PKG-${generate8DigitId()}`
}

/**
 * Generate a unique Gate Pass ID
 * Format: GP-XXXXXXXX (8 digits)
 */
export function generateGatePassId(): string {
  return `GP-${generate8DigitId()}`
}

/**
 * Generate a unique Customer ID
 * Format: CUST-XXXXXXXX (8 digits)
 */
export function generateCustomerId(): string {
  return `CUST-${generate8DigitId()}`
}

/**
 * Check if an ID is unique by checking against existing users
 * This would typically check against a database, but for now we'll use localStorage
 */
export function isIdUnique(id: string, type: 'package' | 'gatepass' | 'customer'): boolean {
  try {
    const existingUsers = JSON.parse(localStorage.getItem('coworking_portal_additional_users') || '[]')
    
    if (type === 'package') {
      return !existingUsers.some((user: any) => user.packageId === id)
    } else if (type === 'gatepass') {
      return !existingUsers.some((user: any) => user.gatePassId === id)
    } else if (type === 'customer') {
      return !existingUsers.some((user: any) => user.customerId === id)
    }
    
    return true
  } catch (error) {
    console.error('Error checking ID uniqueness:', error)
    return true // Assume unique if we can't check
  }
}

/**
 * Generate a unique ID with retries to ensure uniqueness
 */
export function generateUniqueId(type: 'package' | 'gatepass' | 'customer', maxRetries = 10): string {
  let id: string
  let attempts = 0
  
  do {
    if (type === 'package') {
      id = generatePackageId()
    } else if (type === 'gatepass') {
      id = generateGatePassId()
    } else {
      id = generateCustomerId()
    }
    
    attempts++
    
    if (attempts >= maxRetries) {
      console.warn(`Could not generate unique ${type} ID after ${maxRetries} attempts`)
      // Fallback: use timestamp for absolute uniqueness
      const timestamp = Date.now().toString().slice(-8)
      if (type === 'package') {
        id = `PKG-${timestamp}`
      } else if (type === 'gatepass') {
        id = `GP-${timestamp}`
      } else {
        id = `CUST-${timestamp}`
      }
      break
    }
  } while (!isIdUnique(id, type))
  
  return id
}

/**
 * Copies text to clipboard
 * @param text The text to copy
 * @returns Promise that resolves when copy is complete
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // Use modern clipboard API
      await navigator.clipboard.writeText(text)
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand('copy')
      textArea.remove()
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    throw new Error('Failed to copy to clipboard')
  }
}
