
const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const app = express();

// =====================
// CORS FIX (IMPORTANT)
// =====================
app.use(cors({
    origin: "https://fokstech.site",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

app.options("*", cors());

app.use(express.json());

// =====================
// ENV VARIABLES
// =====================
const BOT_TOKEN = process.env.BOT_TOKEN;
const APP_URL = process.env.APP_URL;
const BOT_USERNAME = 'FoksTechBot';

// safety check
if (!BOT_TOKEN) {
    console.error("BOT_TOKEN missing");
    process.exit(1);
}

if (!APP_URL) {
    console.error("APP_URL missing");
    process.exit(1);
}

// =====================
// =====================
const bot = new TelegramBot(BOT_TOKEN, { polling: false });

const downloads = new Map();

const MOVIES_CHANNEL = '-1003888871338';
const APPS_CHANNEL = '-1003704798627';

// =====================
// WEBHOOK ROUTE
// =====================
app.post('/webhook', (req, res) => {
    res.status(200).send('OK');

    try {
        bot.processUpdate(req.body);
    } catch (err) {
        console.error("Webhook error:", err.message);
    }
});

app.get('/webhook', (req, res) => {
    res.send("Webhook active");
});

// =====================
// SET WEBHOOK
// =====================
const WEBHOOK_URL = `${APP_URL}/webhook`;

bot.setWebHook(WEBHOOK_URL)
.then(() => {
    console.log("Webhook set:", WEBHOOK_URL);
})
.catch(err => {
    console.error("Webhook error:", err.message);
});

// =====================
// BOT COMMAND
// =====================
bot.onText(/\/start(.+)?/, async (msg, match) => {
    const chatId = msg.chat.id;

    let code = match?.[1] ? match[1].trim() : '';
    code = code.replace(/@/g, '').trim();

    if (code && downloads.has(code)) {
        const info = downloads.get(code);

        const channelId = info.type === 'movie'
            ? MOVIES_CHANNEL
            : APPS_CHANNEL;

        try {
            await bot.forwardMessage(chatId, channelId, info.messageId);
            downloads.delete(code);

            await bot.sendMessage(chatId, `✅ ${info.title} - Downloading...`);

        } catch (err) {
            await bot.sendMessage(chatId, "Error: " + err.message);
        }

    } else {
        await bot.sendMessage(chatId, "✅ FoksTech Online");
    }
});

// =====================
// API STATUS
// =====================
app.get('/', (req, res) => {
    res.send("FoksTech Bot is running!");
});

app.get('/api/status', (req, res) => {
    res.json({
        online: true,
        active: downloads.size
    });
});

// =====================
// DOWNLOAD API
// =====================
app.post('/api/download', (req, res) => {
    const { title, type, messageId, size, quality } = req.body;

    const code = Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();

    downloads.set(code, {
        title,
        type,
        messageId: parseInt(messageId),
        size,
        quality
    });

    setTimeout(() => downloads.delete(code), 3600000);

    res.json({
        success: true,
        link: `https://t.me/${BOT_USERNAME}?start=${code}`
    });
});

// =====================
// SERVER START
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log("Server running on port", PORT);
    console.log("Bot:", BOT_USERNAME);
    console.log("Webhook:", WEBHOOK_URL);
});
