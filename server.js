const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Simple GET route for webhook test
app.get('/webhook', (req, res) => {
    res.status(200).send('Webhook endpoint is working');
});

// POST route for Telegram webhook
app.post('/webhook', (req, res) => {
    console.log('📨 Webhook received:', req.body);
    // Always send 200 OK immediately
    res.status(200).send('OK');
});

// API status
app.get('/api/status', (req, res) => {
    res.json({ 
        online: true, 
        message: 'Server is running',
        time: new Date().toISOString()
    });
});

// Download endpoint
app.post('/api/download', (req, res) => {
    const { title, type, messageId } = req.body;
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    res.json({
        success: true,
        link: `https://t.me/FoksTechBot?start=${code}`,
        code: code
    });
});

// Root route
app.get('/', (req, res) => {
    res.send('FoksTech Bot Server is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Webhook URL: https://fokstech-backend-production.up.railway.app/webhook`);
});
