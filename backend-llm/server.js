import express from "express";
import cors from "cors";
import { pipeline } from "@huggingface/transformers";

const app = express();
app.use(cors());
app.use(express.json());

console.log("Loading model...");
const flan = await pipeline("text2text-generation", "Xenova/flan-t5-base");
console.log("Model loaded.");

app.post("/generate", async(req, res) => {
    try {
        const { message } = req.body;
        const output = await flan(message, {
            max_new_tokens: 100,
        });

        res.json({ reply: output[0].generated_text });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(5001, () => {
    console.log("Server is running on port 5001");
});