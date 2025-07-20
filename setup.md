# HR Management System Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm run install:all
   ```

2. **Set up Environment Variables**
   ```bash
   cd server
   cp env.example .env
   ```
   
   Edit `server/.env`:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-jwt-key-here"
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL="http://localhost:3000"
   ```

3. **Set up Database**
   ```bash
   cd server
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Start the Application**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000
   - Frontend on http://localhost:3000

## Features Now Working

✅ **Project Creation** - Click "New Project" button to create projects
✅ **Ticket Creation** - Click "New Ticket" button to create support tickets  
✅ **Update Creation** - Click "New Update" button to create project updates
✅ **Real-time Updates** - Dashboard and lists update automatically when items are created
✅ **Notifications** - Success messages appear when items are created
✅ **Responsive Design** - Works on desktop and mobile

## Troubleshooting

### If you get database errors:
```bash
cd server
npx prisma migrate reset
npx prisma migrate dev --name init
```

### If you get port conflicts:
- Change the port in `server/.env` (PORT=5001)
- Update the proxy in `client/package.json` to match

### If socket connection fails:
- Make sure both server and client are running
- Check that the FRONTEND_URL in server/.env matches your client URL
- Check browser console for connection errors

## API Endpoints

- `POST /api/projects` - Create new project
- `POST /api/tickets` - Create new ticket  
- `POST /api/updates` - Create new update
- `GET /api/projects` - Get all projects
- `GET /api/tickets` - Get all tickets
- `GET /api/updates` - Get all updates

## Real-time Events

The system now supports real-time updates via Socket.io:
- `project_update` - When projects are created/updated/deleted
- `ticket_update` - When tickets are created/updated/commented
- `update_created` - When updates are created/updated/deleted 