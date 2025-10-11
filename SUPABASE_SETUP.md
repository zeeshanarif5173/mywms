# 🚀 Supabase Database Setup Guide

## Current Issue
The hostname `db.glvuhieylojaipmytamr.supabase.co` cannot be resolved, which indicates:

1. **Supabase Project Status**: The project might be paused, deleted, or inactive
2. **Network Issues**: DNS resolution problems or network connectivity issues
3. **Incorrect Hostname**: The hostname might be wrong or outdated

## Solution Steps

### Step 1: Check Supabase Dashboard

1. **Go to Supabase Dashboard:**
   - Visit [supabase.com](https://supabase.com)
   - Log into your account
   - Check your project list

2. **Verify Project Status:**
   - Is the project active?
   - Is the database running?
   - Are there any billing issues?

3. **Get Correct Connection Details:**
   - Go to Settings > Database
   - Copy the exact connection string
   - Verify the hostname and credentials

### Step 2: Alternative Connection Methods

If the direct connection doesn't work, try these alternatives:

#### Option A: Connection Pooling
```bash
# Use connection pooling URL (if available)
DATABASE_URL="postgresql://postgres:kjhkj%5E%2655GG@db.glvuhieylojaipmytamr.supabase.co:6543/postgres?pgbouncer=true"
```

#### Option B: SSL Connection
```bash
# Force SSL connection
DATABASE_URL="postgresql://postgres:kjhkj%5E%2655GG@db.glvuhieylojaipmytamr.supabase.co:5432/postgres?sslmode=require"
```

#### Option C: Different Port
```bash
# Try port 6543 (connection pooling)
DATABASE_URL="postgresql://postgres:kjhkj%5E%2655GG@db.glvuhieylojaipmytamr.supabase.co:6543/postgres"
```

### Step 3: Network Troubleshooting

#### Check DNS Resolution:
```bash
# Test DNS resolution
nslookup db.glvuhieylojaipmytamr.supabase.co
dig db.glvuhieylojaipmytamr.supabase.co
```

#### Test Network Connectivity:
```bash
# Test port connectivity
telnet db.glvuhieylojaipmytamr.supabase.co 5432
nc -zv db.glvuhieylojaipmytamr.supabase.co 5432
```

#### Check Firewall/Proxy:
- Ensure no firewall is blocking the connection
- Check if you're behind a corporate proxy
- Try from a different network

### Step 4: Create New Supabase Project

If the current project is not accessible:

1. **Create New Project:**
   - Go to Supabase dashboard
   - Click "New Project"
   - Choose your organization
   - Select a region close to you
   - Set a strong database password

2. **Get New Connection String:**
   - Go to Settings > Database
   - Copy the connection string
   - Update your environment variables

3. **Update Configuration:**
   ```bash
   # Update package.json scripts with new URL
   npm run db:push
   npm run db:seed
   ```

### Step 5: Local Development Alternative

If Supabase continues to have issues, use local PostgreSQL:

#### Install PostgreSQL:
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Create Local Database:
```bash
# Create database
createdb coworking_portal

# Update connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/coworking_portal"
```

### Step 6: Docker Alternative

Use Docker for consistent development environment:

```bash
# Start PostgreSQL with Docker
docker run --name postgres \
  -e POSTGRES_DB=coworking_portal \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Update connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/coworking_portal"
```

## Quick Fix Commands

### Test Current Connection:
```bash
# Test with different connection strings
DATABASE_URL="postgresql://postgres:kjhkj%5E%2655GG@db.glvuhieylojaipmytamr.supabase.co:5432/postgres" node scripts/test-supabase-connection.js
```

### Use Local SQLite (Fallback):
```bash
# Switch back to SQLite for immediate development
npm run dev
```

### Check Application Status:
```bash
# The application should still work with SQLite
# Access at http://localhost:3000
```

## Next Steps

1. **Immediate Solution**: The application is currently running with SQLite and is fully functional
2. **Long-term Solution**: Resolve Supabase connection or set up local PostgreSQL
3. **Production**: Use a reliable cloud database service

## Application Features Working

Even with the database connection issue, the application includes:

✅ **Complete Coworking Portal**
- Customer management
- Complaint system
- Contract requests
- Gate pass system
- Email notifications
- Cron job automation
- Admin dashboard

✅ **Access the Application**
- Frontend: http://localhost:3000
- Database Studio: `npm run db:studio`
- All features are functional

The application is ready to use with SQLite for development, and can be easily migrated to PostgreSQL/Supabase once the connection is resolved.
