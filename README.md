# HR Management System

A modern, full-stack HR Management System built for IT service companies to manage multiple client projects, deliverables, tickets, and team collaboration.

## 🚀 Features

- **User Authentication & Authorization** - JWT-based authentication with role-based access
- **Project Management** - Create, track, and manage client projects
- **Deliverable Tracking** - Monitor project deliverables with deadlines
- **Support Tickets** - Raise and manage support tickets with priority levels
- **Real-time Updates** - Project updates and announcements
- **Dashboard Analytics** - Overview of projects, tickets, and deadlines
- **Responsive Design** - Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Socket.io Client** for real-time features
- **Headless UI** for accessible components
- **Heroicons** for icons

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma ORM** for database management
- **SQLite** for development (easily switchable to PostgreSQL)
- **JWT** for authentication
- **Socket.io** for real-time communication
- **Express Validator** for input validation

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd hr-management
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cd server
   cp env.example .env
   ```
   
   Edit `server/.env` and configure:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-jwt-key-here"
   PORT=5000
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   cd server
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Start the application**
   ```bash
   # From the root directory
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000
   - Frontend on http://localhost:3000

## 🗄️ Database Schema

The system uses the following main entities:
- **Users** - Authentication and user management
- **Projects** - Client project information
- **Deliverables** - Project deliverables with deadlines
- **Tickets** - Support and feature request tickets
- **Updates** - Project updates and announcements
- **Comments** - Ticket comments
- **Notifications** - User notifications

## 🔐 Authentication

The system supports multiple user roles:
- **CLIENT** - Can view their own projects and create tickets
- **MANAGER** - Can manage projects and assign tasks
- **ADMIN** - Full system access
- **EMPLOYEE** - Can work on assigned tasks

## 🚀 Usage

1. **Register/Login** - Create an account or log in
2. **Dashboard** - View project overview and recent activities
3. **Projects** - Create and manage client projects
4. **Tickets** - Raise and track support tickets
5. **Updates** - Post project updates and announcements
6. **Profile** - Manage your account information

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tickets
- `GET /api/tickets` - Get all tickets
- `POST /api/tickets` - Create new ticket
- `PUT /api/tickets/:id` - Update ticket
- `POST /api/tickets/:id/comments` - Add comment to ticket

### Updates
- `GET /api/updates` - Get all updates
- `POST /api/updates` - Create new update
- `PUT /api/updates/:id` - Update update
- `DELETE /api/updates/:id` - Delete update

## 🔧 Development

### Project Structure
```
hr-management/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── index.tsx       # App entry point
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── socket/         # Socket.io handlers
│   │   └── index.ts        # Server entry point
│   ├── prisma/             # Database schema
│   └── package.json
└── package.json            # Root package.json
```

### Available Scripts

**Root directory:**
- `npm run dev` - Start both frontend and backend
- `npm run install:all` - Install all dependencies
- `npm run build` - Build frontend for production

**Server directory:**
- `npm run dev` - Start development server
- `npm run build` - Build TypeScript
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

**Client directory:**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 🚀 Deployment

### Frontend Deployment
The React app can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

### Backend Deployment
The Node.js backend can be deployed to:
- Heroku
- Railway
- DigitalOcean
- AWS
- Any Node.js hosting service

### Database
For production, consider switching from SQLite to:
- PostgreSQL
- MySQL
- MongoDB

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Designed for IT service companies
- Focused on user experience and productivity 