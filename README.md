# Reddit Vote Tracker SaaS

A complete SaaS application for tracking Reddit upvotes and downvotes, built with Next.js, NestJS, and a Chrome extension.

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
# truevotter
