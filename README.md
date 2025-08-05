# Reddit Vote Tracker SaaS

A complete SaaS application for tracking Reddit upvotes and downvotes, built with Next.js, NestJS, and a Chrome extension.

> 📋 **Project Progress**: For detailed development updates, feature changes, and technical decisions, see [project_progress.md](./project_progress.md)

## 🔄 Recent Updates

- ✅ **Fixed Vercel deployment TypeScript dependency issue** - Moved TypeScript from devDependencies to dependencies
- ✅ **Upgraded authentication system with axios configuration** - Implemented centralized axios client with automatic bearer token attachment
- ✅ **Added environment variable support** - Replaced hardcoded API URLs with configurable environment variables
- ✅ **Configured timeout handling** - Added 10-second timeout for all API requests with proper error handling
- ✅ **Enhanced request/response interceptors** - Automatic token management and 401 error handling with redirect
- ✅ **Updated all authentication components** - Migrated from direct fetch calls to configured axios instance
- ✅ **Maintained backward compatibility** - Preserved existing authentication flow while upgrading infrastructure
- ✅ **Fixed TypeScript build errors** - Resolved use-toast.ts type issues breaking Vercel deployment
- ✅ **Made backend CORS configuration dynamic** - Replaced hardcoded frontend URLs with environment variables

## 🚨 Development Rules

### Testing Vercel Builds Locally
**CRITICAL**: Always test Vercel builds locally before pushing changes to production branches:

```bash
cd frontend
npm run build  # Must pass without TypeScript errors
npm run lint   # Check for code quality issues
npm run dev    # Verify functionality still works
```

**Why this matters:**
- Vercel builds fail on TypeScript errors that may not appear in development
- Local testing prevents deployment failures and saves time
- Ensures production stability and reduces rollback risk
- Catches type issues that only surface during production builds

**Before every push:**
1. Run `npm run build` and ensure it completes successfully
2. Test core functionality in development mode
3. Only push if both build and functionality tests pass

## 🚀 Features

- **Real-time Vote Tracking**: Automatically track upvotes and downvotes on Reddit posts
- **Beautiful Dashboard**: Modern UI built with Next.js and shadcn/ui components
- **Robust Backend**: NestJS API with in-memory storage for vote data
- **Chrome Extension**: Seamlessly integrates with Reddit to capture vote interactions
- **Analytics**: View statistics, top subreddits, and most active users

## 🏗️ Architecture

### Backend (NestJS)
- **Port**: 8000
- **Storage**: In-memory database (easily replaceable with MongoDB)
- **API Endpoints**:
  - `POST /votes` - Create new vote record
  - `GET /votes` - Retrieve all votes
  - `GET /votes/stats` - Get vote statistics
  - `POST /users` - Create user
  - `GET /users` - Get all users

### Frontend (Next.js + shadcn/ui)
- **Port**: 5173
- **Framework**: React with Vite
- **UI Library**: shadcn/ui components with Tailwind CSS
- **Features**: 
  - Real-time vote statistics dashboard
  - Recent vote activity feed
  - Top subreddits and users analytics
  - Responsive design

### Chrome Extension
- **Manifest Version**: 3
- **Permissions**: activeTab, storage, scripting
- **Features**:
  - Automatic vote detection on Reddit
  - Real-time data sync with backend
  - Popup interface with statistics
  - Background service worker

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Chrome browser (for extension)

### Backend Setup
```bash
cd backend
npm install
npm run start:dev
```
The backend will start on http://localhost:8000

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will start on http://localhost:5173

### Chrome Extension Setup
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `chrome-extension` directory
4. The extension will appear in your Chrome toolbar

## 📱 Usage

1. **Start the Backend**: Run the NestJS server
2. **Start the Frontend**: Run the React development server
3. **Install Extension**: Load the Chrome extension
4. **Visit Reddit**: Go to reddit.com or old.reddit.com
5. **Vote on Posts**: Click upvote/downvote buttons on any post
6. **View Analytics**: Check the dashboard or extension popup for tracked data

## 🔧 API Documentation

### Vote Endpoints

#### Create Vote
```http
POST /votes
Content-Type: application/json

{
  "postId": "abc123",
  "postTitle": "Example Post Title",
  "postUrl": "https://reddit.com/r/example/comments/abc123",
  "subreddit": "example",
  "username": "reddit_user",
  "voteType": "upvote",
  "timestamp": "2025-08-04T09:37:00.000Z"
}
```

#### Get All Votes
```http
GET /votes
```

#### Get Vote Statistics
```http
GET /votes/stats
```

Returns:
```json
{
  "totalVotes": 10,
  "upvotes": 7,
  "downvotes": 3,
  "topSubreddits": [
    { "_id": "programming", "count": 5 },
    { "_id": "javascript", "count": 3 }
  ],
  "topUsers": [
    { "_id": "user1", "count": 4 },
    { "_id": "user2", "count": 3 }
  ]
}
```

## 🎨 Frontend Components

- **Dashboard**: Main analytics view with vote statistics
- **Vote Cards**: Individual vote entries with metadata
- **Statistics Cards**: Real-time counters for votes and users
- **Tabs Interface**: Switch between recent votes, subreddits, and users
- **Responsive Design**: Works on desktop and mobile devices

## 🔌 Chrome Extension Features

- **Content Script**: Automatically detects Reddit vote buttons
- **Background Worker**: Handles data synchronization
- **Popup Interface**: Quick access to statistics and dashboard
- **Vote Notifications**: Visual feedback when votes are tracked
- **Cross-Platform**: Works on both new and old Reddit interfaces

## 🚀 Deployment

### Backend Deployment
The backend can be deployed to any Node.js hosting service:
- Heroku
- Vercel
- AWS Lambda
- DigitalOcean

### Frontend Deployment
The frontend can be deployed to static hosting services:
- Vercel
- Netlify
- GitHub Pages
- AWS S3

### Chrome Extension Distribution
Package the extension for Chrome Web Store distribution:
1. Create a developer account
2. Package the extension directory
3. Submit for review

## 🔄 Data Flow

1. User clicks vote button on Reddit
2. Chrome extension content script detects the action
3. Extension extracts post metadata (title, URL, subreddit, etc.)
4. Vote data is sent to NestJS backend via API
5. Backend stores vote in in-memory database
6. Frontend fetches updated data and displays analytics
7. Extension popup shows real-time statistics

## 🛡️ Security Considerations

- **CORS**: Properly configured for local development
- **Input Validation**: All API inputs are validated using class-validator
- **Data Sanitization**: User inputs are sanitized before storage
- **Extension Permissions**: Minimal required permissions for Reddit access

## 🔧 Development

### Backend Development
- Hot reload enabled with `npm run start:dev`
- TypeScript with strict mode
- ESLint and Prettier configured
- Modular architecture with separate modules for votes and users

### Frontend Development
- Vite for fast development and building
- TypeScript support
- Tailwind CSS for styling
- shadcn/ui component library

### Extension Development
- Manifest V3 for modern Chrome extension standards
- Content script injection for Reddit integration
- Service worker for background processing

## 📊 Current Status

✅ **Backend**: Fully functional NestJS API with vote tracking
✅ **Frontend**: Complete React dashboard with real-time data
✅ **Chrome Extension**: Ready for installation and testing
✅ **Integration**: All components communicate successfully
✅ **Testing**: API endpoints tested, frontend displays data correctly

## 🎯 Next Steps

- [ ] Replace in-memory storage with MongoDB
- [ ] Add user authentication and authorization
- [ ] Implement real-time WebSocket updates
- [ ] Add data export functionality
- [ ] Create user profiles and personalized analytics
- [ ] Add Chrome Web Store packaging
- [ ] Implement data persistence and backup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test all components
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
# TrueVotter - Reddit Vote Tracker

A comprehensive SaaS platform to track Reddit upvotes and downvotes with secure authentication and Chrome extension integration.

## 🚀 Features

- **User Authentication**: Secure login/signup with JWT tokens
- **Reddit Integration**: Chrome extension intercepts Reddit vote actions
- **Vote Tracking**: Real-time tracking of upvotes, downvotes, and vote removals
- **Dashboard**: Beautiful analytics dashboard with vote statistics
- **Post Ownership**: Detect and track votes on your own posts
- **MongoDB Storage**: Persistent data storage with user relationships
- **Security**: Protected API endpoints and secure Chrome extension communication

## 🏗️ Architecture

- **Backend**: NestJS with MongoDB, JWT authentication, RESTful API
- **Frontend**: Next.js with NextAuth v5, Tailwind CSS, shadcn/ui
- **Chrome Extension**: Content script with Reddit XHR interception
- **Database**: MongoDB with User, Vote, and Post collections

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Chrome browser for extension testing
- Git for version control

## 🛠️ Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/hamdisoudani/truevotter.git
cd truevotter
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create environment file (see Environment Configuration section below)
cp .env.example .env
# Edit .env with your MongoDB connection string and JWT secret

# Start development server
npm run start:dev
```

The backend will run on `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend
npm install

# Create environment file (see Environment Configuration section below)
cp .env.local.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Chrome Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` directory from this project
5. The extension should now appear in your Chrome toolbar

## 🔧 Environment Configuration

### Backend Environment (.env)

Create `/backend/.env` with the following content:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/truevotter?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=8000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

**Required Values:**
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A secure random string for JWT token signing (minimum 32 characters)
- `PORT`: Backend server port (default: 8000)
- `FRONTEND_URL`: Frontend URL for CORS configuration

### Frontend Environment (.env.local)

Create `/frontend/.env.local` with the following content:

```env
# API Configuration
VITE_API_URL=http://localhost:8000

# NextAuth Configuration (if using NextAuth)
NEXTAUTH_URL=http://localhost:5173
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Development Configuration
NODE_ENV=development
```

**Required Values:**
- `VITE_API_URL`: Backend API URL (default: http://localhost:8000)
- `NEXTAUTH_URL`: Frontend URL for NextAuth callbacks
- `NEXTAUTH_SECRET`: Secret key for NextAuth session encryption

## 🚀 Usage

### 1. User Registration & Login

1. Start both backend and frontend servers
2. Navigate to `http://localhost:5173`
3. Register a new account or login with existing credentials
4. Your dashboard will show vote statistics and tracked posts

### 2. Chrome Extension Usage

1. Install the Chrome extension (see setup instructions above)
2. Navigate to Reddit (`https://www.reddit.com`)
3. The extension will automatically:
   - Detect your Reddit user ID from XHR requests
   - Track your vote actions (upvote/downvote/remove)
   - Send vote data to your backend
   - Link your Reddit account to your TrueVotter account

### 3. Vote Tracking

The extension intercepts these Reddit API calls:
- **User ID Detection**: `https://matrix.redditspace.com/_matrix/client/v3/account/whoami`
- **Vote Actions**: `https://www.reddit.com/svc/shreddit/graphql` (UpdatePostVoteState operation)

Vote types tracked:
- `UP`: Upvote action
- `DOWN`: Downvote action  
- `NONE`: Vote removal (when user removes their vote)

### 4. Post Ownership Detection

When viewing your own Reddit posts, the extension detects the "See More Insights" link pattern and offers to track votes on that specific post.

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile (protected)
- `PATCH /auth/link-reddit` - Link Reddit account (protected)

### Votes
- `POST /votes` - Create vote record (protected)
- `GET /votes` - Get user's votes (protected)
- `GET /votes/my-stats` - Get vote statistics (protected)
- `GET /votes/post/:postId` - Get votes for specific post (protected)

### Posts
- `POST /posts` - Add post to tracking (protected)
- `GET /posts` - Get tracked posts (protected)
- `GET /posts/:postId/is-owner` - Check post ownership (protected)

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm run test
npm run test:e2e
```

### Integration Testing

Run the comprehensive integration test:

```bash
node test-integration.js
```

This tests:
- User registration and authentication
- Reddit account linking
- Vote creation and tracking
- Statistics generation
- MongoDB data persistence

### Chrome Extension Testing

1. Install the extension in Chrome
2. Navigate to Reddit and perform vote actions
3. Check the extension popup for vote counts
4. Verify data appears in the frontend dashboard
5. Check browser console for extension logs

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: All sensitive endpoints require authentication
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Input Validation**: Request validation using class-validator
- **Password Hashing**: Secure password storage with bcrypt
- **Environment Variables**: Sensitive data stored in environment files

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Verify your MongoDB URI in `.env`
   - Check network connectivity
   - Ensure MongoDB Atlas IP whitelist includes your IP

2. **Chrome Extension Not Loading**
   - Check `chrome://extensions/` for error messages
   - Verify all extension files are present
   - Check browser console for JavaScript errors

3. **CORS Errors**
   - Verify `FRONTEND_URL` in backend `.env`
   - Check that frontend is running on the specified URL
   - Clear browser cache and cookies

4. **Vote Tracking Not Working**
   - Ensure you're logged in to both TrueVotter and Reddit
   - Check browser console for extension logs
   - Verify Reddit XHR requests are being intercepted

### Debug Mode

Enable debug logging by setting:

```env
# Backend .env
NODE_ENV=development
LOG_LEVEL=debug

# Frontend .env.local
NODE_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Hamdi Soudani** (@hamdisoudani) - Initial development
- **Devin AI** - Implementation assistance

## 🔗 Links

- [GitHub Repository](https://github.com/hamdisoudani/truevotter)
- [Devin Session](https://app.devin.ai/sessions/82114ae56e9040e28145d1fe496477ac)

---

**Note**: This is a development setup guide. For production deployment, additional security measures and environment configurations are recommended.
