import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getPersistentPackages, savePersistentPackages } from '@/lib/persistent-packages'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const packages = getPersistentPackages()
    const pkg = packages.find((p: any) => p.id === params.id)

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    return NextResponse.json(pkg, { status: 200 })
  } catch (error) {
    console.error('Error fetching package:', error)
    return NextResponse.json(
      { error: 'Failed to fetch package' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only managers and admins can update packages
    if (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, type, price, duration, features, limitations, branchIds, isActive } = body

    // Validate required fields
    if (!name || !price || !type) {
      return NextResponse.json(
        { error: 'Name, price, and type are required' },
        { status: 400 }
      )
    }

    // Get existing packages from server storage
    const packages = getPersistentPackages()
    const packageIndex = packages.findIndex((p: any) => p.id === params.id)

    if (packageIndex === -1) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    // Update package
    const updatedPackage = {
      ...packages[packageIndex],
      name,
      description: description || '',
      type,
      price: parseFloat(price),
      currency: 'PKR', // Always PKR for Pakistani system
      duration: parseInt(duration) || 30,
      features: features || [],
      limitations: limitations || [],
      isActive: isActive !== undefined ? isActive : true,
      branchIds: branchIds || [],
      updatedAt: new Date().toISOString()
    }

    // Update in persistent storage
    packages[packageIndex] = updatedPackage
    savePersistentPackages(packages)

    return NextResponse.json(updatedPackage, { status: 200 })
  } catch (error) {
    console.error('Error updating package:', error)
    return NextResponse.json(
      { error: 'Failed to update package' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can delete packages
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get existing packages from server storage
    const packages = getPersistentPackages()
    const packageIndex = packages.findIndex((p: any) => p.id === params.id)

    if (packageIndex === -1) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    // Remove package from persistent storage
    packages.splice(packageIndex, 1)
    savePersistentPackages(packages)

    return NextResponse.json({ message: 'Package deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting package:', error)
    return NextResponse.json(
      { error: 'Failed to delete package' },
      { status: 500 }
    )
  }
}
