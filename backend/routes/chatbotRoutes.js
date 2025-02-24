const express = require("express");
const router = express.Router();
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req, res) => {
    try {
        const { message } = req.body;

        // Define a strict system message to limit responses to health topics only
        const prompt = `
        You are a helpful AI chatbot specializing in mental health and medical symptom discussions. 
        You should only respond to health-related queries about symptoms, mental well-being, and self-care.
        If the user asks something unrelated, politely decline to answer.
        User: ${message}
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "system", content: prompt }],
            max_tokens: 200,
        });

        res.json({ reply: response.choices[0].message.content });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

module.exports = router;
