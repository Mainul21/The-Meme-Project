# Meme Generator Project

A modern, full-stack meme generator application with MongoDB storage and a beautiful React frontend.

## 🚀 Features

- **Create Custom Memes**: Generate memes from popular templates
- **Drag & Drop Text**: Position text anywhere on the meme
- **Text Customization**: Adjust font size, color, and style
- **Save to Cloud**: Store memes in MongoDB Atlas
- **Gallery View**: Browse and manage your saved memes
- **Download & Share**: Export memes as high-quality images
- **Responsive Design**: Works on desktop and mobile

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- React Router
- Tailwind CSS
- Lucide Icons

### Backend
- Node.js
- Express
- MongoDB Atlas
- Mongoose

## 📦 Project Structure

```
The meme Project/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── package.json
├── backend/           # Express backend API
│   ├── models/        # MongoDB models
│   ├── routes/        # API routes
│   └── server.js
├── render.yaml        # Render deployment config
└── DEPLOYMENT.md      # Deployment guide
```

## 🏃‍♂️ Local Development

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- npm or yarn

### Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd "The meme Project"
   ```

2. **Install dependencies**:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Configure environment variables**:
   
   Create `backend/.env`:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   ```

   The frontend `.env` is already configured for local development.

4. **Start the development servers**:
   
   **Terminal 1 - Backend**:
   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2 - Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

5. **Open your browser**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api/health

## 🌐 Deployment

This project is configured for deployment on **Render.com**.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Render

1. Push your code to GitHub
2. Connect your repository to Render
3. Render will automatically detect `render.yaml` and deploy both services
4. Add your `MONGODB_URI` environment variable in Render dashboard

## 📝 API Endpoints

- `GET /api/health` - Health check
- `GET /api/memes` - Get all memes (with pagination)
- `GET /api/memes/:id` - Get single meme
- `POST /api/memes` - Create new meme
- `DELETE /api/memes/:id` - Delete meme

## 🎨 Features in Detail

### Meme Creation
- Choose from popular meme templates
- Add custom text with drag-and-drop positioning
- Customize text appearance (size, color, stroke)
- Real-time preview

### Gallery Management
- View all saved memes in a grid layout
- Click to view full-size
- Download memes as PNG
- Delete unwanted memes
- Offline fallback to localStorage

### Responsive Design
- Mobile-friendly interface
- Touch-optimized controls
- Adaptive layouts

## 🔧 Configuration

### Frontend Environment Variables
- `VITE_API_URL` - Backend API URL (auto-configured for local dev)

### Backend Environment Variables
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

## 🐛 Troubleshooting

### Backend won't connect to MongoDB
- Verify your MongoDB Atlas connection string
- Check network access settings in MongoDB Atlas
- Ensure IP whitelist includes 0.0.0.0/0 or your IP

### Frontend can't reach backend
- Verify backend is running on port 5000
- Check `VITE_API_URL` in frontend/.env
- Check browser console for CORS errors

### Build errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear Vite cache: `npm run dev -- --force`

## 📄 License

MIT License - feel free to use this project for learning or personal use.

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

## 📧 Contact

For questions or issues, please open a GitHub issue.

---

**Built with ❤️ using React, Node.js, and MongoDB**
