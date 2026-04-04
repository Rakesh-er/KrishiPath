import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Updated CORS to allow multiple origins
app.use(cors({
  origin: ["http://localhost:5175", "http://localhost:3000", "http://127.0.0.1:5500", "http://localhost:8080"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Health check route
app.get("/", (req, res) => {
  res.send("✅ KrishiPath Server is running");
});

// Fixed chatbot route - now matches frontend call to /api/chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message, language } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Enhanced farming-specific prompt
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
    
    Please respond in ${language || "English"} and provide practical, actionable advice.
    If the question is not farming-related, politely redirect to farming topics.
    
    User Question: ${message}
    
    Your helpful response:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500
    });

    const botMessage = completion.choices[0].message.content;
    res.json({ reply: botMessage });
  } catch (error) {
    console.error("Chat API error:", error);
    
    // Provide fallback response if OpenAI fails
    const fallbackResponses = {
      "Hindi": "माफ करें, मैं अभी आपकी सहायता नहीं कर सकता। कृपया बाद में पुनः प्रयास करें।",
      "English": "I'm sorry, I'm having technical difficulties right now. Please try again later.",
      "Telugu": "క్షమించండి, నేను ప్రస్తుతం మీకు సహాయం చేయలేకపోతున్నాను. దయచేసి తర్వాత మళ్లీ ప్రయత్నించండి.",
      "Odia": "ଦୁଃଖିତ, ମୁଁ ବର୍ତ୍ତମାନ ଆପଣଙ୍କର ସାହାଯ୍ୟ କରିପାରୁନାହିଁ। ଦୟାକରି ପରେ ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।"
    };
    
    const fallback = fallbackResponses[req.body.language] || fallbackResponses["English"];
    res.status(500).json({ reply: fallback });
  }
});

// User registration route
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Chat API available at http://localhost:${PORT}/api/chat`);
});