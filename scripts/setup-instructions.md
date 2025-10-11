# 🚀 Database Setup Instructions

## Current Issue
The Supabase database hostname `db.glvuhieylojaipmytamr.supabase.co` cannot be resolved, which means either:
- The Supabase project is paused or deleted
- The hostname is incorrect
- There are network connectivity issues

## Solution Options

### Option 1: Fix Supabase Connection (Recommended)

1. **Check Supabase Dashboard:**
   - Go to [supabase.com](https://supabase.com)
   - Log into your account
   - Check if your project is active
   - Verify the database is running
   - Check the connection string in Settings > Database

2. **Verify Connection String:**
   - Copy the exact connection string from Supabase dashboard
   - Make sure there are no typos in the hostname
   - Check if the password is correct

3. **Check Network Settings:**
   - Ensure your IP is not blocked
   - Check if there are any firewall restrictions
   - Try from a different network

### Option 2: Install PostgreSQL Locally

**macOS (using Homebrew):**
```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL service
brew services start postgresql

# Create database
createdb coworking_portal
```

**Ubuntu/Debian:**
```bash
# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb coworking_portal
```

**Windows:**
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Install with default settings
3. Create database using pgAdmin or command line

### Option 3: Use Docker (Easiest)

**Install Docker:**
- macOS: Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
- Ubuntu: `sudo apt-get install docker.io docker-compose`
- Windows: Download Docker Desktop

**Start Database:**
```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Check if it's running
docker ps
```

### Option 4: Use SQLite for Development

If you want to get started quickly without PostgreSQL:

1. **Install SQLite:**
   ```bash
   # macOS (usually pre-installed)
   brew install sqlite
   
   # Ubuntu
   sudo apt-get install sqlite3
   ```

2. **Update Prisma Schema:**
   Change the provider in `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

3. **Update Database Scripts:**
   ```bash
   npm run db:push
   npm run db:seed
   ```

## Once Database is Ready

1. **Update Environment:**
   Create a `.env.local` file:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/coworking_portal"
   # or for SQLite:
   # DATABASE_URL="file:./dev.db"
   ```

2. **Run Database Setup:**
   ```bash
   npm run db:push
   npm run db:seed
   ```

3. **Start Application:**
   ```bash
   npm run dev
   ```

## Database Management Tools

- **Prisma Studio:** `npm run db:studio`
- **Adminer (if using Docker):** http://localhost:8080
- **pgAdmin:** For PostgreSQL management
- **DBeaver:** Universal database tool

## Troubleshooting

### Connection Issues:
- Check if database service is running
- Verify connection string
- Check firewall settings
- Try different ports

### Permission Issues:
- Check user permissions
- Verify database exists
- Check schema access

### Network Issues:
- Test with `ping` command
- Check DNS resolution
- Try different network
- Check proxy settings

## Next Steps

Once you have a working database connection:

1. **Run the setup:**
   ```bash
   npm run db:push
   npm run db:seed
   ```

2. **Start the application:**
   ```bash
   npm run dev
   ```

3. **Access the portal:**
   - Frontend: http://localhost:3000
   - Database Studio: http://localhost:5555 (if using Prisma Studio)

The application includes:
- ✅ Customer management
- ✅ Complaint system
- ✅ Contract requests
- ✅ Gate pass system
- ✅ Email notifications
- ✅ Cron job automation
- ✅ Admin dashboard
