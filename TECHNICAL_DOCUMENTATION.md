# Meme Dashboard - Technical Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Frontend Architecture](#frontend-architecture)
7. [Backend Architecture](#backend-architecture)
8. [Deployment](#deployment)
9. [Development Setup](#development-setup)
10. [Configuration](#configuration)
11. [Troubleshooting](#troubleshooting)

---

## System Overview

Meme Dashboard is a full-stack web application that enables users to create, customize, and share memes. The application features a React-based frontend with a Node.js/Express backend, using MongoDB Atlas for persistent storage.

### Key Features
- **Meme Creation**: Select from popular templates and add customizable text
- **Drag-and-Drop Text**: Position text anywhere on the meme canvas
- **Text Customization**: Adjust color, size, and styling
- **Cloud Storage**: Save memes to MongoDB Atlas
- **Gallery Management**: View, download, and delete saved memes
- **Offline Fallback**: LocalStorage backup when server is unavailable
- **Responsive Design**: Mobile-friendly interface

---

## Architecture

### System Architecture Diagram

```mermaid
graph TB
    User[User Browser]
    Frontend[React Frontend<br/>Vite + React Router]
    Backend[Express Backend<br/>Node.js API]
    DB[(MongoDB Atlas)]
    Storage[LocalStorage<br/>Fallback]
    
    User -->|HTTPS| Frontend
    Frontend -->|REST API| Backend
    Backend -->|Mongoose| DB
    Frontend -.->|Backup| Storage
    
    subgraph "Render.com Deployment"
        Frontend
        Backend
    end
```

### Request Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB
    
    U->>F: Select template
    F->>U: Display canvas
    U->>F: Add text & customize
    U->>F: Click Save
    F->>F: Export canvas to base64
    F->>B: POST /api/memes
    B->>DB: Save meme document
    DB->>B: Return saved meme
    B->>F: Success response
    F->>F: Backup to localStorage
    F->>U: Show success message
```

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| Vite | 5.4.10 | Build tool & dev server |
| React Router | 6.28.0 | Client-side routing |
| Tailwind CSS | 3.4.14 | Styling framework |
| Lucide React | 0.460.0 | Icon library |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 22.x | Runtime environment |
| Express | 4.18.2 | Web framework |
| Mongoose | 8.0.0 | MongoDB ODM |
| CORS | 2.8.5 | Cross-origin requests |
| dotenv | 16.3.1 | Environment variables |

### Database
- **MongoDB Atlas**: Cloud-hosted NoSQL database
- **Storage**: Base64-encoded images stored in documents

### Deployment
- **Platform**: Render.com
- **CI/CD**: Automatic deployment via GitHub integration
- **Configuration**: Infrastructure as Code via `render.yaml`

---

## Database Schema

### Meme Collection

```javascript
{
  _id: ObjectId,
  name: String,           // Meme title (required)
  imageData: String,      // Base64-encoded PNG (required)
  template: String,       // Template name (required)
  captions: [String],     // Array of text captions
  createdAt: Date         // Auto-generated timestamp
}
```

#### Field Specifications

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Meme title, typically first caption or "Untitled Meme" |
| `imageData` | String | Yes | Base64-encoded PNG image (up to 50MB) |
| `template` | String | Yes | Name of the meme template used |
| `captions` | Array | No | Text captions added to the meme |
| `createdAt` | Date | Auto | Timestamp of creation |

#### Indexes
- Default index on `_id`
- Recommended: Index on `createdAt` for sorting

---

## API Documentation

### Base URL
- **Production**: `https://meme-backend-3i5g.onrender.com/api`
- **Development**: `http://localhost:5000/api`

### Endpoints

#### 1. Health Check
```http
GET /api/health
```

**Response**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

#### 2. Get All Memes
```http
GET /api/memes?page=1&limit=20
```

**Query Parameters**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Integer | 1 | Page number |
| `limit` | Integer | 20 | Items per page |

**Response**
```json
{
  "memes": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Distracted Boyfriend",
      "imageData": "data:image/png;base64,...",
      "template": "Distracted Boyfriend",
      "captions": ["Me", "New Framework", "My Current Project"],
      "createdAt": "2024-11-28T10:30:00.000Z"
    }
  ],
  "currentPage": 1,
  "totalPages": 5,
  "totalMemes": 87
}
```

---

#### 3. Get Single Meme
```http
GET /api/memes/:id
```

**Parameters**
- `id` (path): MongoDB ObjectId

**Response**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Distracted Boyfriend",
  "imageData": "data:image/png;base64,...",
  "template": "Distracted Boyfriend",
  "captions": ["Me", "New Framework", "My Current Project"],
  "createdAt": "2024-11-28T10:30:00.000Z"
}
```

**Error Response (404)**
```json
{
  "error": "Meme not found"
}
```

---

#### 4. Create Meme
```http
POST /api/memes
Content-Type: application/json
```

**Request Body**
```json
{
  "name": "My Meme",
  "imageData": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "template": "Drake Hotline Bling",
  "captions": ["Bad code", "Good code"]
}
```

**Response (201)**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "My Meme",
  "imageData": "data:image/png;base64,...",
  "template": "Drake Hotline Bling",
  "captions": ["Bad code", "Good code"],
  "createdAt": "2024-11-28T10:30:00.000Z"
}
```

**Error Response (400)**
```json
{
  "error": "Missing required fields"
}
```

---

#### 5. Delete Meme
```http
DELETE /api/memes/:id
```

**Parameters**
- `id` (path): MongoDB ObjectId

**Response (200)**
```json
{
  "message": "Meme deleted successfully"
}
```

**Error Response (404)**
```json
{
  "error": "Meme not found"
}
```

---

## Frontend Architecture

### Component Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── DashboardLayout.jsx    # Main layout wrapper
│   │   ├── Header.jsx              # Top navigation bar
│   │   └── Sidebar.jsx             # Side navigation menu
│   ├── Meme/
│   │   ├── MemeCanvas.jsx          # Canvas for meme rendering
│   │   └── TemplateSelector.jsx    # Template grid selector
│   └── UI/
│       ├── Button.jsx              # Reusable button component
│       ├── Card.jsx                # Card container component
│       └── Input.jsx               # Form input component
├── pages/
│   ├── CreateMeme.jsx              # Meme creation page
│   └── Gallery.jsx                 # Meme gallery page
├── services/
│   └── api.js                      # API client service
├── utils/
│   └── memeStorage.js              # LocalStorage utilities
├── App.jsx                         # Root component with routing
├── main.jsx                        # Application entry point
└── index.css                       # Global styles
```

### Key Components

#### MemeCanvas.jsx
- **Purpose**: Renders meme with draggable text overlays
- **Features**:
  - Canvas-based image rendering
  - Drag-and-drop text positioning
  - High-resolution export (uses original image dimensions)
  - Responsive scaling for display
- **Export Function**: Exposed via ref for parent components

#### TemplateSelector.jsx
- **Purpose**: Displays meme templates in a grid
- **Layout**: Fixed 2-column grid
- **Features**: Template preview, selection state, lazy loading

#### Gallery.jsx
- **Purpose**: Display and manage saved memes
- **Features**: Grid layout, modal preview, download, delete

### State Management
- **Local State**: React `useState` for component-level state
- **No Global State**: Simple prop drilling for data flow
- **API Service**: Centralized API calls in `services/api.js`

### Routing

```javascript
/ → Redirect to /create
/create → CreateMeme page
/gallery → Gallery page
/* → 404 Not Found
```

---

## Backend Architecture

### Project Structure

```
backend/
├── models/
│   └── Meme.js              # Mongoose schema
├── routes/
│   └── memes.js             # API route handlers
├── .env                     # Environment variables
├── server.js                # Express server setup
└── package.json             # Dependencies
```

### Middleware Stack

```javascript
app.use(cors({
  origin: ['https://meme-frontend-l6zg.onrender.com', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
```

### Error Handling

- **Global Error Handler**: Catches unhandled errors
- **Route-Level Try-Catch**: All async routes wrapped
- **Graceful Degradation**: Server starts even if MongoDB is unavailable

### MongoDB Connection

```javascript
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));
} else {
  console.warn('⚠️ MONGODB_URI not defined');
}
```

---

## Deployment

### Render.com Configuration

The project uses `render.yaml` for Infrastructure as Code deployment.

#### Services

**Backend (Web Service)**
```yaml
- type: web
  name: meme-backend
  runtime: node
  region: oregon
  plan: free
  buildCommand: npm install
  startCommand: npm start
  rootDir: backend
  envVars:
    - key: NODE_ENV
      value: production
    - key: PORT
      value: 10000
    - key: MONGODB_URI
      sync: false
  healthCheckPath: /api/health
```

**Frontend (Static Site)**
```yaml
- type: web
  name: meme-frontend
  runtime: static
  buildCommand: npm install && npm run build
  staticPublishPath: dist
  rootDir: frontend
  envVars:
    - key: VITE_API_URL
      value: https://meme-backend-3i5g.onrender.com/api
  routes:
    - type: rewrite
      source: /*
      destination: /index.html
```

### Deployment Process

1. **Push to GitHub**: Code changes trigger deployment
2. **Build Phase**: 
   - Backend: `npm install`
   - Frontend: `npm install && npm run build`
3. **Deploy Phase**:
   - Backend: Starts Express server on port 10000
   - Frontend: Serves static files from `dist/`
4. **Health Check**: Render pings `/api/health` endpoint

### Environment Variables

#### Backend
| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `NODE_ENV` | No | Set to `production` |
| `PORT` | No | Auto-set by Render (10000) |

#### Frontend
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL |

---

## Development Setup

### Prerequisites
- Node.js v16+ 
- npm or yarn
- MongoDB Atlas account
- Git

### Installation

```bash
# Clone repository
git clone <repository-url>
cd "The meme Project"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

**Backend `.env`**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/MemeDB
PORT=5000
NODE_ENV=development
```

**Frontend `.env`** (optional for local dev)
```env
VITE_API_URL=http://localhost:5000/api
```

### Running Locally

**Terminal 1 - Backend**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

### Build Commands

**Frontend Production Build**
```bash
cd frontend
npm run build
# Output: dist/
```

**Preview Production Build**
```bash
npm run preview
```

---

## Configuration

### CORS Configuration

The backend restricts API access to specific origins:

```javascript
app.use(cors({
  origin: [
    'https://meme-frontend-l6zg.onrender.com',
    'http://localhost:5173'
  ],
  credentials: true
}));
```

### Image Size Limits

- **Request Body**: 50MB limit for base64 images
- **MongoDB Document**: 16MB BSON limit (enforced by MongoDB)
- **Recommendation**: Keep images under 5MB for performance

### Pagination Defaults

- **Default Page**: 1
- **Default Limit**: 20 items
- **Max Limit**: No hard limit (consider adding for production)

---

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

**Symptoms**: Backend logs show connection errors

**Solutions**:
- Verify `MONGODB_URI` in environment variables
- Check MongoDB Atlas network access (whitelist `0.0.0.0/0`)
- Ensure database user has read/write permissions
- Verify connection string format

#### 2. CORS Errors

**Symptoms**: Browser console shows CORS policy errors

**Solutions**:
- Verify frontend origin is in CORS whitelist
- Check `VITE_API_URL` points to correct backend
- Ensure backend is running and accessible

#### 3. Build Failures on Render

**Symptoms**: Deployment fails during build

**Solutions**:
- Check build logs in Render dashboard
- Verify `package.json` dependencies are correct
- Ensure `vite` is in `dependencies`, not `devDependencies`
- Check `setup.js` runs successfully (copies `meme.json`)

#### 4. Images Not Displaying

**Symptoms**: Memes show broken images

**Solutions**:
- Check base64 encoding is valid
- Verify image data includes proper data URI prefix
- Check browser console for errors
- Ensure CORS allows image loading

#### 5. Text Not Draggable

**Symptoms**: Cannot move text on canvas

**Solutions**:
- Ensure JavaScript is enabled
- Check browser console for errors
- Verify `MemeCanvas` component is rendering
- Test with different browser

### Performance Optimization

**Frontend**:
- Lazy load template images
- Debounce drag events
- Use production build for deployment
- Enable gzip compression

**Backend**:
- Add database indexes on `createdAt`
- Implement response caching
- Consider CDN for static assets
- Upgrade to paid Render plan for better performance

### Monitoring

**Health Check**:
```bash
curl https://meme-backend-3i5g.onrender.com/api/health
```

**Database Connection**:
- Check Render logs for MongoDB connection status
- Monitor MongoDB Atlas metrics

---

## Security Considerations

### Current Implementation
- ✅ CORS restricted to specific origins
- ✅ Environment variables for secrets
- ✅ Input validation on API endpoints
- ✅ MongoDB injection protection via Mongoose

### Recommendations for Production
- [ ] Add authentication (JWT or OAuth)
- [ ] Implement rate limiting (express-rate-limit)
- [ ] Add request size validation
- [ ] Sanitize user inputs
- [ ] Add HTTPS enforcement
- [ ] Implement CSP headers
- [ ] Add logging and monitoring

---

## Future Enhancements

### Planned Features
- User authentication and profiles
- Meme sharing via unique URLs
- Social media integration
- Advanced text effects (shadows, gradients)
- Template upload functionality
- Meme voting/rating system

### Technical Improvements
- WebSocket for real-time updates
- Image optimization (WebP format)
- Server-side rendering (SSR)
- Progressive Web App (PWA)
- Automated testing (Jest, Cypress)
- CI/CD pipeline enhancements

---

## Support

For issues or questions:
- Check this documentation
- Review GitHub issues
- Check Render deployment logs
- Verify MongoDB Atlas status

---

**Last Updated**: November 28, 2024  
**Version**: 1.0.0  
**Maintainer**: Meme Dashboard Team
