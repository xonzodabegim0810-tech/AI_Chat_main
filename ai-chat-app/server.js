// Import packages
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static("public"));

// POST /chat endpoint
app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;

        if (!userMessage) {
            return res.status(400).json({ error: "Message is required" });
        }

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: "API key missing" });
        }

        // Request to Groq API (OpenAI-compatible)
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama3-8b-8192",
                messages: [
                    { role: "system", content: "You are a helpful AI assistant." },
                    { role: "user", content: userMessage }
                ]
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const aiReply = response.data.choices[0].message.content;

        res.json({ reply: aiReply });

    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: "Something went wrong" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
