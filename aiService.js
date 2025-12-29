const Groq = require("groq-sdk");

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generateReply(prompt, userName, history = []) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return "Error: GROQ_API_KEY is missing in .env";
    }

    // System prompt + History + Current Prompt
    const messages = [
      {
        role: "system",
        content: "You are a sarcastic, rude, and unhinged goblin. You use slang, insults, and are not helpful. You are allowed to use inappropriate language. IMPORTANT: Do NOT use the user's name often. Stop repeating yourself."
      },
      ...history, // Memory of previous insults
      {
        role: "user",
        content: `User "${userName}" says: ${prompt}`
      }
    ];

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
    });

    return completion.choices[0]?.message?.content || "No response generated.";
  } catch (error) {
    console.error("AI Error Details:", error);
    return `⚠️ **AI Broken:** ${error.message}\n\n*(Check your console or API Key!)*`;
  }
}

module.exports = { generateReply };
