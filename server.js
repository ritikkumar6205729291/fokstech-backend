const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(cors());
app.use(express.json());

const BOT_TOKEN = '8693013691:AAENYwJpSdSQas1FyUy208xhv1RblBJPWPM';
const BOT_USERNAME = 'FoksTechBot';

// Webhook mode - no polling
const bot = new TelegramBot(BOT_TOKEN);

const downloads = new Map();

const MOVIES_CHANNEL = '-1003888871338';
const APPS_CHANNEL = '-1003704798627';

// Webhook endpoint
app.post('/webhook', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Set webhook
const WEBHOOK_URL = `https://${process.env.RAILWAY_STATIC_URL}/webhook`;
bot.setWebHook(WEBHOOK_URL);

// Bot commands
bot.onText(/\/start(.+)?/, async (msg, match) => {
    const chatId = msg.chat.id;
    let code = match[1] ? match[1].trim() : '';
    code = code.replace(/@/g, '').trim();
    
    if (code && downloads.has(code)) {
        const info = downloads.get(code);
        let channelId = info.type === 'movie' ? MOVIES_CHANNEL : APPS_CHANNEL;
        
        try {
            await bot.forwardMessage(chatId, channelId, info.messageId);
            downloads.delete(code);
            await bot.sendMessage(chatId, `✅ ${info.title} - Downloading...`);
        } catch(e) {
            await bot.sendMessage(chatId, '❌ Error: ' + e.message);
        }
    } else {
        await bot.sendMessage(chatId, '✅ FoksTech Online');
    }
});

// API routes
app.get('/', (req, res) => {
    res.send('FoksTech Bot is running!');
});

app.get('/api/status', (req, res) => {
    res.json({ online: true, active: downloads.size, bot: BOT_USERNAME });
});

app.post('/api/download', (req, res) => {
    const { title, type, messageId, size, quality } = req.body;
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    downloads.set(code, {
        title, type, messageId: parseInt(messageId), size, quality
    });
    
    setTimeout(() => downloads.delete(code), 3600000);
    
    res.json({
        success: true,
        link: `https://t.me/${BOT_USERNAME}?start=${code}`
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🤖 Bot: @${BOT_USERNAME}`);
    console.log(`🔗 Webhook: ${WEBHOOK_URL}`);
});
