import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.js';
import produceRoutes from './routes/produce.js';
import transactionRoutes from './routes/transaction.js';
import aiRoutes from './routes/ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (
    process.env.CORS_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean)
) || [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5175',
    'http://127.0.0.1:5500',
    'http://localhost:8080'
];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '2mb' }));

if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET is not set — auth routes will fail until it is configured.');
}

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/krishipath')
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

app.get('/', (req, res) => {
    res.send('✅ KrishiPath Server is running');
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message, language } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (!openai) {
            return res.status(503).json({
                error: 'Chat service unavailable',
                reply: 'OpenAI is not configured on this server.'
            });
        }

        const prompt = `You are KrishiPath, an expert farming assistant chatbot designed to help farmers in India. 
    You specialize in:
    - Crop cultivation techniques and best practices
    - Weather-related farming advice
    - Pest and disease management
    - Soil health and fertilization
    - Government farming schemes and subsidies
    - Market prices and crop selection
    - Modern farming technologies
    - Seasonal farming calendar
    
    Please respond in ${language || 'English'} and provide practical, actionable advice.
    If the question is not farming-related, politely redirect to farming topics.
    
    User Question: ${message}
    
    Your helpful response:`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 500
        });

        const botMessage = completion.choices[0].message.content;
        res.json({ reply: botMessage });
    } catch (error) {
        console.error('Chat API error:', error);

        const fallbackResponses = {
            Hindi: 'माफ करें, मैं अभी आपकी सहायता नहीं कर सकता। कृपया बाद में पुनः प्रयास करें।',
            English: "I'm sorry, I'm having technical difficulties right now. Please try again later.",
            Telugu: 'క్షమించండి, నేను ప్రస్తుతం మీకు సహాయం చేయలేకపోతున్నాను. దయచేసి తర్వాత మళ్లీ ప్రయత్నించండి.',
            Odia: 'ଦୁଃଖିତ, ମୁଁ ବର୍ତ୍ତମାନ ଆପଣଙ୍କର ସାହାଯ୍ୟ କରିପାରୁନାହିଁ। ଦୟାକରି ପରେ ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।'
        };

        const lang = req.body?.language;
        const fallback = fallbackResponses[lang] || fallbackResponses.English;
        res.status(500).json({ reply: fallback });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/produce', produceRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/ai', aiRoutes);

app.use((req, res) => {
    res.status(404).json({ message: 'Not found', path: req.originalUrl });
});

app.use((err, req, res, next) => {
    console.error(err.stack || err);
    res.status(500).json({ error: 'Something went wrong!' });
});

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    socket.on('disconnect', () => {});
});

app.set('io', io);

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API base: http://localhost:${PORT}/api`);
});
