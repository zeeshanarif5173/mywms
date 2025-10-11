import { NextRequest, NextResponse } from 'next/server'

// Check if we're in a build-time environment
export const isBuildTime = () => {
  return process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'preview'
}

// Safe API wrapper that handles build-time scenarios
export const createSafeApiHandler = (handler: (req: NextRequest) => Promise<NextResponse>) => {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // If we're in build time, return mock data
      if (isBuildTime()) {
        return NextResponse.json({
          success: true,
          data: [],
          message: 'Build-time mock response'
        })
      }
      
      // Otherwise, run the actual handler
      return await handler(req)
    } catch (error) {
      console.error('API Error:', error)
      
      // If we're in build time, return a safe error response
      if (isBuildTime()) {
        return NextResponse.json({
          success: false,
          error: 'Build-time error - API not available',
          data: []
        })
      }
      
      // Otherwise, return the actual error
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

// Mock data generators for build time
export const mockResponses = {
  customers: () => ({
    success: true,
    data: [
      {
        id: 1,
        name: 'John Customer',
        email: 'customer@example.com',
        phone: '+1-555-0123',
        company: 'TechCorp',
        accountStatus: 'Active',
        gatePassId: 'GP-001',
        packageId: 1,
        branchId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  }),
  
  invoices: () => ({
    success: true,
    data: [
      {
        id: 1,
        invoiceNumber: 'INV-001',
        customerId: 1,
        branchId: 1,
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'DRAFT',
        subtotal: 1000,
        taxRate: 0.1,
        taxAmount: 100,
        total: 1100,
        notes: 'Mock invoice',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  }),
  
  branches: () => ({
    success: true,
    data: [
      {
        id: 1,
        name: 'Main Branch',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        phone: '+1-555-0123',
        email: 'main@company.com',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  }),
  
  vendors: () => ({
    success: true,
    data: [
      {
        id: 1,
        name: 'Sample Vendor',
        email: 'vendor@example.com',
        phone: '+1-555-0124',
        address: '456 Vendor St',
        taxId: 'TAX123456',
        branchId: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  }),
  
  users: () => ({
    success: true,
    data: [
      {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'ADMIN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  }),
  
  default: () => ({
    success: true,
    data: [],
    message: 'Mock response for build time'
  })
}
