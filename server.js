const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Basic route - MUST work
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

// Webhook GET (for testing)
app.get('/webhook', (req, res) => {
    res.send('Webhook endpoint is ready');
});

// Webhook POST (Telegram will use this)
app.post('/webhook', (req, res) => {
    console.log('Webhook received:', req.body);
    res.status(200).send('OK');
});

// Download API
app.post('/api/download', (req, res) => {
    const { title, type, messageId, size, quality } = req.body;
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    console.log(`Download request: ${title}, MsgID: ${messageId}, Code: ${code}`);
    
    res.json({
        success: true,
        link: `https://t.me/FoksTechBot?start=${code}`,
        code: code
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Base URL: https://fokstech-backend-production.up.railway.app`);
});
