# Coworking Management Portal

A modern coworking space management system built with Next.js, Express, PostgreSQL, and Prisma.

## Features

- 🔐 **Authentication** - Secure user authentication with NextAuth.js
- 👥 **Customer Management** - Manage coworking members and their details
- 📊 **Dashboard** - Overview of members, active accounts, and statistics
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 🗄️ **Database** - PostgreSQL with Prisma ORM

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Express.js, Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **State Management**: React Query

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd coworking-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update the `.env.local` file with your database credentials:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/coworking_portal"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Optional: Seed the database
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server (both client and server)
- `npm run dev:client` - Start Next.js development server
- `npm run dev:server` - Start Express server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed the database

## Database Schema

The application uses the following main models:

- **User** - Authentication and user management
- **Customer** - Coworking space members
- **Account** - OAuth account connections
- **Session** - User sessions

## Features Overview

### Authentication
- Secure login with email/password
- Session management
- Role-based access (CUSTOMER, MANAGER, ADMIN)

### Customer Management
- Add new customers
- View customer details
- Update customer information
- Account status management (ACTIVE/LOCKED)

### Dashboard
- Overview statistics
- Customer list with filtering
- Real-time data updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
