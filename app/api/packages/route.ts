import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getPersistentPackages, savePersistentPackages } from '@/lib/persistent-packages'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get packages from persistent storage
    let packages = getPersistentPackages()
    
    // Only initialize with default packages if never initialized before (file doesn't exist)
    if (packages.length === 0) {
      const defaultPackages = [
        {
          id: 'PKG-001',
          name: 'Basic Coworking',
          description: 'Basic coworking package with essential amenities',
          type: 'monthly' as const,
          price: 15000,
          currency: 'PKR',
          duration: 30,
          features: ['Hot desk access', 'WiFi', 'Coffee', 'Printing'],
          limitations: ['No dedicated space', 'Limited meeting room access'],
          isActive: true,
          branchIds: ['1'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'PKG-002',
          name: 'Premium Office',
          description: 'Premium office package with dedicated space',
          type: 'monthly' as const,
          price: 25000,
          currency: 'PKR',
          duration: 30,
          features: ['Dedicated desk', 'Storage', 'Meeting room access', 'Phone booth'],
          limitations: ['Limited to one location'],
          isActive: true,
          branchIds: ['1'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'PKG-003',
          name: 'Flexible Workspace',
          description: 'Flexible workspace package for dynamic teams',
          type: 'monthly' as const,
          price: 18000,
          currency: 'PKR',
          duration: 30,
          features: ['Flexible seating', 'Meeting rooms', 'Event space', 'Networking'],
          limitations: ['Subject to availability'],
          isActive: true,
          branchIds: ['2'],
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z'
        },
        {
          id: 'PKG-004',
          name: 'Executive Suite',
          description: 'Executive suite package with premium amenities',
          type: 'monthly' as const,
          price: 35000,
          currency: 'PKR',
          duration: 30,
          features: ['Private office', 'Executive lounge', 'Concierge service', 'Premium meeting rooms'],
          limitations: ['Limited availability'],
          isActive: true,
          branchIds: ['2'],
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z'
        }
      ]
      savePersistentPackages(defaultPackages)
      packages = defaultPackages
    }

    return NextResponse.json(packages, { status: 200 })
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only managers and admins can create packages
    if (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, type, price, duration, features, limitations, branchIds, isActive = true } = body

    // Validate required fields
    if (!name || !price || !type) {
      return NextResponse.json(
        { error: 'Name, price, and type are required' },
        { status: 400 }
      )
    }

    // Get existing packages from persistent storage
    const existingPackages = getPersistentPackages()
    
    // Create new package
    const newPackage = {
      id: `PKG-${String(existingPackages.length + 1).padStart(3, '0')}`,
      name,
      description: description || '',
      type,
      price: parseFloat(price),
      currency: 'PKR', // Always PKR for Pakistani system
      duration: parseInt(duration) || 30,
      features: features || [],
      limitations: limitations || [],
      isActive,
      branchIds: branchIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add to persistent storage
    const updatedPackages = [...existingPackages, newPackage]
    savePersistentPackages(updatedPackages)

    return NextResponse.json(newPackage, { status: 201 })
  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json(
      { error: 'Failed to create package' },
      { status: 500 }
    )
  }
}
