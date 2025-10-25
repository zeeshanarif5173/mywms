import { NextRequest, NextResponse } from 'next/server'
import { getPersistentBranches, savePersistentBranches } from '@/lib/persistent-branches'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const branches = getPersistentBranches()
    const branch = branches.find(b => b.id === params.id)
    
    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }
    
    return NextResponse.json(branch)
  } catch (error) {
    console.error('Error fetching branch:', error)
    return NextResponse.json({ error: 'Failed to fetch branch' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, address, city, state, zipCode, phone, email, isActive } = body

    // Get existing branches from persistent storage
    const existingBranches = getPersistentBranches()
    
    // Find the branch to update
    const branchIndex = existingBranches.findIndex(branch => branch.id === params.id)
    if (branchIndex === -1) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    // Check if name already exists for other branches
    if (name && name !== existingBranches[branchIndex].name) {
      const nameExists = existingBranches.some(branch => branch.name === name && branch.id !== params.id)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get existing branches from persistent storage
    const existingBranches = getPersistentBranches()
    
    // Find the branch to delete
    const branchIndex = existingBranches.findIndex(branch => branch.id === params.id)
    if (branchIndex === -1) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    // Remove branch from persistent storage
    const updatedBranches = existingBranches.filter(branch => branch.id !== params.id)
    savePersistentBranches(updatedBranches)

    return NextResponse.json({ message: 'Branch deleted successfully' })
  } catch (error) {
    console.error('Error deleting branch:', error)
    return NextResponse.json({ error: 'Failed to delete branch' }, { status: 500 })
  }
}
