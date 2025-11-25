const fs = require('fs');
const content = `MONGODB_URI="mongodb+srv://memeMaster:oZDj1Mo7zkLqhzNc@cluster0.ykuj4.mongodb.net/memeDB?retryWrites=true&w=majority"
PORT=5000`;
fs.writeFileSync('.env', content);
console.log('.env updated successfully');
