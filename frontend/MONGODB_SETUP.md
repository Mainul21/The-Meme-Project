# MongoDB Backend Setup Instructions

## Step 1: Get Your MongoDB Connection String

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log in to your account
3. Click on **"Connect"** for your cluster
4. Choose **"Connect your application"**
5. Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster.xxxxx.mongodb.net/`)
6. Replace `<password>` with your actual database password

## Step 2: Configure Backend

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create a `.env` file (copy from `.env.example`):
   ```bash
   copy .env.example .env
   ```

3. Open `.env` file and add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster.xxxxx.mongodb.net/meme-db?retryWrites=true&w=majority
   PORT=5000
   ```

## Step 3: Install Backend Dependencies

```bash
npm install
```

## Step 4: Start the Backend Server

```bash
npm start
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:5000
```

## Step 5: Start the Frontend (New Terminal)

Open a **new terminal** and run:

```bash
npm run dev
```

## Testing

1. Create a meme and click **"Save"**
2. You should see **"Saved to Cloud!"** message
3. Open the Gallery - your meme should appear
4. Open in a different browser/incognito - the meme should still be visible (shared across users!)

## Troubleshooting

**Backend won't start:**
- Make sure MongoDB connection string is correct in `.env`
- Check if port 5000 is available

**"Saved Locally" instead of "Saved to Cloud":**
- Backend server is not running
- Check backend terminal for errors

**Gallery shows "Offline":**
- Backend server is not running
- Will fallback to localStorage (personal memes only)
