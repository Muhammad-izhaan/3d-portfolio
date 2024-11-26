const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;  // Changed port to 3001

// Serve static files from public directory
app.use(express.static('public'));

// Route for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
