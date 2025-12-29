```javascript
const Groq = require("groq-sdk");

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generateReply(prompt, userName, history = [], imageUrl = null) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return "Error: GROQ_API_KEY is missing in .env";
    }

    let model = "llama-3.3-70b-versatile";
    let userContent = `User "${userName}" says: ${ prompt } `;

    // System prompt + History + Current Prompt
    const messages = [
        {
          role: "system",
          content: "You are a sarcastic, rude, and unhinged goblin. You use slang, insults, and are not helpful. You are allowed to use inappropriate language. IMPORTANT: Do NOT use the user's name often. Stop repeating yourself."
        },
        ...history 
    ];

    // Handle Vision (Image)
    if (imageUrl) {
        model = "llama-3.2-11b-vision-preview"; // Switch to Vision Model
        
        messages.push({
            role: "user",
            content: [
                { type: "text", text: userContent },
                { type: "image_url", image_url: { url: imageUrl } }
            ]
        });
    } else {
        messages.push({
            role: "user",
            content: userContent
        });
    }

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: model,
    });

    return completion.choices[0]?.message?.content || "No response generated.";
  } catch (error) {
    console.error("AI Error Details:", error);
    return `⚠️ ** AI Broken:** ${ error.message } \n\n * (Check your console or API Key!)* `;
  }
}

module.exports = { generateReply };
