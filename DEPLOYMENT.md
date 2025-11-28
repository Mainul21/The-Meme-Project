# Render Deployment Guide

This guide will help you deploy your meme project to Render.com.

## Prerequisites

1. **GitHub Account** - Your code needs to be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **MongoDB Atlas** - Your MongoDB connection string (already set up)

## Deployment Steps

### Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - ready for deployment"
   ```

2. **Create GitHub Repository**:
   - Go to [github.com](https://github.com) and create a new repository
   - Name it something like `meme-generator`
   - Don't initialize with README (you already have files)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Render

#### Option A: Using render.yaml (Recommended - Automated)

1. **Connect to Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click **"New +"** → **"Blueprint"**
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

2. **Configure Environment Variables**:
   - In the Render dashboard, find your **meme-backend** service
   - Go to **Environment** tab
   - Add your MongoDB URI:
     - Key: `MONGODB_URI`
     - Value: `your_mongodb_connection_string`

3. **Deploy**:
   - Click **"Apply"** to deploy both services
   - Wait for deployment to complete (5-10 minutes)

#### Option B: Manual Deployment

If you prefer to deploy manually:

**Deploy Backend:**
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `meme-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NODE_ENV`: `production`
5. Click **"Create Web Service"**

**Deploy Frontend:**
1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `meme-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://meme-backend.onrender.com/api` (use your actual backend URL)
5. Click **"Create Static Site"**

### Step 3: Verify Deployment

1. **Check Backend**:
   - Visit: `https://your-backend-name.onrender.com/api/health`
   - Should return: `{"status":"OK","message":"Server is running"}`

2. **Check Frontend**:
   - Visit: `https://your-frontend-name.onrender.com`
   - Test creating and saving a meme
   - Check the gallery

### Step 4: Update Frontend with Backend URL (if using Manual Deployment)

If you deployed manually, you need to update the frontend with the backend URL:

1. In Render dashboard, go to your **frontend** service
2. Go to **Environment** tab
3. Update `VITE_API_URL` to your backend URL (e.g., `https://meme-backend.onrender.com/api`)
4. Save and wait for automatic redeployment

## Important Notes

### Free Tier Limitations

> **⚠️ Cold Starts**: Free tier services spin down after 15 minutes of inactivity. The first request after inactivity will take 30-60 seconds to wake up.

### Environment Variables

**Backend (.env)**:
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `NODE_ENV` - Set to `production`
- `PORT` - Automatically set by Render (10000)

**Frontend**:
- `VITE_API_URL` - Your backend API URL (e.g., `https://meme-backend.onrender.com/api`)

### CORS Configuration

The backend is already configured to accept requests from any origin (`cors()` middleware). This is fine for this project, but for production apps, you should restrict it:

```javascript
app.use(cors({
  origin: 'https://your-frontend-url.onrender.com'
}));
```

## Troubleshooting

### Backend Issues

**MongoDB Connection Failed**:
- Verify `MONGODB_URI` is correct in Render environment variables
- Check MongoDB Atlas network access allows all IPs (0.0.0.0/0)

**Service Won't Start**:
- Check Render logs for errors
- Verify `package.json` has correct start script

### Frontend Issues

**API Calls Failing**:
- Verify `VITE_API_URL` is set correctly
- Check backend is running and accessible
- Check browser console for CORS errors

**Build Failed**:
- Check Render build logs
- Verify all dependencies are in `package.json`
- Try building locally: `npm run build`

### Slow Response Times

This is normal for free tier services due to cold starts. Upgrade to paid tier for always-on services.

## Updating Your App

After making changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

Render will automatically detect the push and redeploy your services.

## Custom Domains (Optional)

You can add custom domains in Render:
1. Go to your service settings
2. Click **"Custom Domains"**
3. Follow instructions to add your domain

## Monitoring

- **Logs**: View real-time logs in Render dashboard
- **Metrics**: Check service health and performance
- **Alerts**: Set up email alerts for service failures

## Next Steps

1. Test all functionality in production
2. Share your live URL!
3. Consider upgrading to paid tier for better performance
4. Set up custom domain (optional)

## Your Deployed URLs

After deployment, your URLs will be:
- **Frontend**: `https://meme-frontend.onrender.com`
- **Backend**: `https://meme-backend.onrender.com`
- **API Health Check**: `https://meme-backend.onrender.com/api/health`

(Replace with your actual service names)
