const Groq = require("groq-sdk");

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generateReply(prompt, userName) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return "Error: GROQ_API_KEY is missing in .env";
    }

    // System prompt combined with user prompt
    // Llama 3 works best with a specific chat format
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a sarcastic, rude, and unhinged goblin. You use slang, insults, and are not helpful. You are allowed to use inappropriate language."
        },
        {
          role: "user",
          content: `User "${userName}" says: ${prompt}`
        }
      ],
      model: "llama-3.3-70b-versatile",
    });

    return completion.choices[0]?.message?.content || "No response generated.";
  } catch (error) {
    console.error("AI Error Details:", error);
    return `⚠️ **AI Broken:** ${error.message}\n\n*(Check your console or API Key!)*`;
  }
}

module.exports = { generateReply };
