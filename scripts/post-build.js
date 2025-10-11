#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '..', 'app', 'api');
const disabledDir = path.join(__dirname, '..', 'app', 'api-disabled');

console.log('🔧 Post-build: Restoring API routes...');

// Restore all routes from disabled directory
if (fs.existsSync(disabledDir)) {
  const restoreRoutes = (src, dest) => {
    if (!fs.existsSync(src)) return;
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    entries.forEach(entry => {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        // Create destination directory if it doesn't exist
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        restoreRoutes(srcPath, destPath);
      } else {
        // Create parent directory if it doesn't exist
        const parentDir = path.dirname(destPath);
        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir, { recursive: true });
        }
        
        // Move file back
        if (fs.existsSync(srcPath)) {
          fs.renameSync(srcPath, destPath);
        }
      }
    });
    
    // Remove empty directory
    try {
      if (fs.existsSync(src)) {
        const remainingEntries = fs.readdirSync(src);
        if (remainingEntries.length === 0) {
          fs.rmdirSync(src);
        }
      }
    } catch (e) {
      // Directory not empty, ignore
    }
  };
  
  const disabledSubdirs = fs.readdirSync(disabledDir);
  disabledSubdirs.forEach(subdir => {
    const srcPath = path.join(disabledDir, subdir);
    const destPath = path.join(apiDir, subdir);
    
    if (fs.existsSync(srcPath)) {
      restoreRoutes(srcPath, destPath);
      console.log(`✅ Restored: ${subdir}`);
    }
  });
  
  // Remove the disabled directory if empty
  try {
    fs.rmdirSync(disabledDir);
  } catch (e) {
    // Directory not empty, ignore
  }
}

console.log('✅ Post-build: All API routes restored');
