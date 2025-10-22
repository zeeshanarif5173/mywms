import { NextRequest, NextResponse } from 'next/server'
import { getPersistentBranches, savePersistentBranches } from '@/lib/persistent-branches'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const branches = getPersistentBranches()
    return NextResponse.json(branches)
  } catch (error) {
    console.error('Error fetching branches:', error)
    return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, address, city, state, zipCode, phone, email } = body

    // Validate required fields
    if (!name || !address || !city || !state) {
      return NextResponse.json({ error: 'Name, address, city, and state are required' }, { status: 400 })
    }

    // Get existing branches from persistent storage
    const existingBranches = getPersistentBranches()
    
    // Check if branch name already exists
    const nameExists = existingBranches.some(branch => branch.name === name)
    if (nameExists) {
      return NextResponse.json({ error: 'Branch name already exists' }, { status: 400 })
    }

    // Create new branch
    const newBranch = {
      id: `branch-${Date.now()}`,
      name,
      address,
      city,
      state,
      zipCode: zipCode || '',
      phone: phone || '',
      email: email || '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add to persistent storage
    const updatedBranches = [...existingBranches, newBranch]
    savePersistentBranches(updatedBranches)

    return NextResponse.json(newBranch, { status: 201 })
  } catch (error) {
    console.error('Error creating branch:', error)
    return NextResponse.json({ error: 'Failed to create branch' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, address, city, state, zipCode, phone, email, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'Branch ID is required' }, { status: 400 })
    }

    // Get existing branches from persistent storage
    const existingBranches = getPersistentBranches()
    
    // Find the branch to update
    const branchIndex = existingBranches.findIndex(branch => branch.id === id)
    if (branchIndex === -1) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    // Check if name already exists for other branches
    if (name && name !== existingBranches[branchIndex].name) {
      const nameExists = existingBranches.some(branch => branch.name === name && branch.id !== id)
      if (nameExists) {
        return NextResponse.json({ error: 'Branch name already exists for another branch' }, { status: 400 })
      }
    }

    // Update branch
    const updatedBranch = {
      ...existingBranches[branchIndex],
      name: name || existingBranches[branchIndex].name,
      address: address || existingBranches[branchIndex].address,
      city: city || existingBranches[branchIndex].city,
      state: state || existingBranches[branchIndex].state,
      zipCode: zipCode !== undefined ? zipCode : existingBranches[branchIndex].zipCode,
      phone: phone !== undefined ? phone : existingBranches[branchIndex].phone,
      email: email !== undefined ? email : existingBranches[branchIndex].email,
      isActive: isActive !== undefined ? isActive : existingBranches[branchIndex].isActive,
      updatedAt: new Date().toISOString()
    }

    // Update in persistent storage
    const updatedBranches = [...existingBranches]
    updatedBranches[branchIndex] = updatedBranch
    savePersistentBranches(updatedBranches)

    return NextResponse.json(updatedBranch)
  } catch (error) {
    console.error('Error updating branch:', error)
    return NextResponse.json({ error: 'Failed to update branch' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Branch ID is required' }, { status: 400 })
    }

    // Get existing branches from persistent storage
    const existingBranches = getPersistentBranches()
    
    // Find the branch to delete
    const branchIndex = existingBranches.findIndex(branch => branch.id === id)
    if (branchIndex === -1) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    // Remove branch from persistent storage
    const updatedBranches = existingBranches.filter(branch => branch.id !== id)
    savePersistentBranches(updatedBranches)

    return NextResponse.json({ message: 'Branch deleted successfully' })
  } catch (error) {
    console.error('Error deleting branch:', error)
    return NextResponse.json({ error: 'Failed to delete branch' }, { status: 500 })
  }
}