# Debugging Checklist

## If you're getting an error, please check:

### 1. Backend Installation Error
If `npm install` failed in the backend folder:
- Make sure you're in the `backend` directory
- Try running: `npm install --legacy-peer-deps`
- Check if Node.js and npm are installed: `node --version` and `npm --version`

### 2. Backend Server Error
If the server won't start:
- Make sure you created the `.env` file (copy from `.env.example`)
- Add your MongoDB connection string to `.env`
- Check if port 5000 is already in use

### 3. Frontend Error
If you see errors in the browser console:
- Make sure the backend server is running
- Check browser console (F12) for specific error messages
- The app will fallback to localStorage if backend is offline

### 4. Common Issues
- **"Cannot find module"** → Run `npm install` in backend folder
- **"ECONNREFUSED"** → Backend server is not running
- **"Invalid connection string"** → Check MongoDB URI in `.env`
- **Port already in use** → Change PORT in `.env` to different number

## Next Steps
Please share:
1. What command you ran
2. The full error message
3. Where you saw the error (terminal/browser)
