const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.send('FoksTech Bot Server is running!');
});

// Status route
app.get('/api/status', (req, res) => {
    res.json({
        online: true,
        message: 'Server is working',
        timestamp: new Date().toISOString()
    });
});

// Webhook route
app.get('/webhook', (req, res) => {
    res.send('Webhook endpoint is ready');
});

app.post('/webhook', (req, res) => {
    res.status(200).send('OK');
});

// Download route
app.post('/api/download', (req, res) => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    res.json({
        success: true,
        link: `https://t.me/FoksTechBot?start=${code}`,
        code: code
    });
});

// IMPORTANT: Railway uses PORT environment variable
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Base URL: https://${process.env.RAILWAY_STATIC_URL || 'localhost'}`);
});
