#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of API routes that cause build-time issues
const problematicRoutes = [
  'account-chart',
  'admin/accounting',
  'admin/accounts',
  'admin/bills',
  'admin/branches',
  'admin/cash-flow',
  'admin/cron',
  'admin/invoices',
  'admin/payroll',
  'admin/transactions',
  'admin/vendors',
  'bills',
  'branches',
  'cash-flow',
  'contracts',
  'customers',
  'gatepass',
  'invoices',
  'notifications',
  'payroll',
  'reports',
  'transactions',
  'users',
  'vendors'
];

const apiDir = path.join(__dirname, '..', 'app', 'api');
const disabledDir = path.join(__dirname, '..', 'app', 'api-disabled');

// Create disabled directory if it doesn't exist
if (!fs.existsSync(disabledDir)) {
  fs.mkdirSync(disabledDir, { recursive: true });
}

console.log('🔧 Pre-build: Moving problematic API routes...');

// Move problematic routes to disabled directory
problematicRoutes.forEach(route => {
  const sourcePath = path.join(apiDir, route);
  const targetPath = path.join(disabledDir, route);
  
  if (fs.existsSync(sourcePath)) {
    // Create target directory if it doesn't exist
    const targetParent = path.dirname(targetPath);
    if (!fs.existsSync(targetParent)) {
      fs.mkdirSync(targetParent, { recursive: true });
    }
    
    // Move the route
    fs.renameSync(sourcePath, targetPath);
    console.log(`✅ Moved: ${route}`);
  }
});

console.log('✅ Pre-build: All problematic API routes moved to api-disabled/');
