# Database Setup Guide

## Current Status
The application is configured to use your Supabase PostgreSQL database, but there are connection issues. The system will automatically fall back to mock data if the database is not available.

## Database Configuration

### Your Supabase Credentials
- **Host**: `db.takwrqhkchgflsugmegk.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres`
- **Password**: `STJGblu8iQ808znF`
- **API Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRha3dycWhrY2hnZmxzdWdtZWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NDEzMDEsImV4cCI6MjA3NTQxNzMwMX0.yr64VUOGlW_eXJRdIj-x-i_4sF0SuS3NlVrSRDLXK_E`

### Connection URL
```
postgresql://postgres:STJGblu8iQ808znF@db.takwrqhkchgflsugmegk.supabase.co:5432/postgres
```

## Troubleshooting Connection Issues

### 1. Network Connectivity
The hostname `db.takwrqhkchgflsugmegk.supabase.co` is not resolving. This could be due to:

- **Firewall restrictions**: Your network might be blocking the connection
- **DNS issues**: The hostname might not be accessible from your location
- **Supabase region**: The database might be in a different region

### 2. Alternative Connection Methods

#### Option A: Use Supabase Dashboard
1. Go to your Supabase dashboard
2. Navigate to Settings > Database
3. Copy the connection string from there
4. Update the `DATABASE_URL` in your environment

#### Option B: Use Connection Pooling
Try using the connection pooling URL instead:
```
postgresql://postgres:STJGblu8iQ808znF@db.takwrqhkchgflsugmegk.supabase.co:6543/postgres?pgbouncer=true
```

#### Option C: Use Direct Connection
Try connecting directly through the Supabase client instead of Prisma.

### 3. Environment Variables

Create a `.env.local` file in your project root:
```env
DATABASE_URL="postgresql://postgres:STJGblu8iQ808znF@db.takwrqhkchgflsugmegk.supabase.co:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

## Current Fallback System

The application is designed to work with both real database and mock data:

### 1. Database Service Layer
- **File**: `lib/db-service.ts`
- **Function**: Automatically detects database availability
- **Fallback**: Uses mock data if database is not available

### 2. API Endpoints
All API endpoints have been updated to use the database service:
- Customer management
- Complaints system
- Time tracking
- Meeting room bookings

### 3. Data Persistence
- **Mock Data**: Stored in localStorage (persists across sessions)
- **Real Database**: Stored in PostgreSQL (when connection is available)

## Testing the Connection

### 1. Test Database Connection
```bash
node scripts/test-connection.js
```

### 2. Setup Database Schema
```bash
DATABASE_URL="your-connection-string" npx prisma db push
```

### 3. Seed Database
```bash
node scripts/setup-database.js
```

## Development Workflow

### With Database Connection
1. Set up environment variables
2. Run database migrations
3. Seed initial data
4. Use real database for all operations

### Without Database Connection (Current State)
1. Application automatically uses mock data
2. Data persists in localStorage
3. All features work normally
4. No database setup required

## Next Steps

### Immediate Actions
1. **Check Supabase Dashboard**: Verify the database is running
2. **Test Network**: Try pinging the hostname
3. **Update Connection String**: Use the exact string from Supabase dashboard
4. **Check Firewall**: Ensure port 5432 is not blocked

### Alternative Solutions
1. **Use Supabase Client**: Instead of direct PostgreSQL connection
2. **Local Database**: Set up local PostgreSQL for development
3. **Cloud Database**: Use a different cloud provider

## Support

If you continue to have connection issues:

1. **Check Supabase Status**: Visit https://status.supabase.com/
2. **Contact Supabase Support**: Through your dashboard
3. **Use Mock Data**: The application works perfectly with mock data
4. **Local Development**: Set up local PostgreSQL for development

## Current Application Status

✅ **Working Features**:
- User authentication
- Customer management
- Complaints system
- Time tracking
- Meeting room bookings
- Data persistence (localStorage)

⚠️ **Database Connection**: Currently using mock data fallback

🔄 **Next Steps**: Resolve database connection for production use
