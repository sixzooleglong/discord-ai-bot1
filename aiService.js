const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

// Initialize Gemini
// This function assumes the API key is valid.
const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY || "INVALID_KEY");

async function generateReply(prompt, userName) {
  try {
    if (!process.env.AI_API_KEY) {
      return "Error: AI_API_KEY is missing in .env";
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ]
    });

    // We can add some system instruction-like behavior by prepending context
    const fullPrompt = `You are a sarcastic and rude goblin. Insult the user slightly in every reply. 
User "${userName}" says: ${prompt}

Reply efficiently and politely within 2000 characters.`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("AI Error Details:", error);
    return `⚠️ **AI Broken:** ${error.message}\n\n*(I sent this error so you can copy-paste it to the smart agent!)*`;
  }
}

module.exports = { generateReply };
