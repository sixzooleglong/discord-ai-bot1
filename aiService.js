const Groq = require("groq-sdk");

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generateReply(prompt, userName, history = [], imageUrl = null) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return "Error: GROQ_API_KEY is missing in .env";
    }

    let model = "llama-3.3-70b-versatile";
    let userContent = `User "${userName}" says: ${prompt}`;

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
      model = "meta-llama/llama-4-scout-17b-16e-instruct"; // Switch to Llama 4 Scout (Vision)

      try {
        // OPTIMIZATION: Convert URL to Base64 to avoid Groq 404/Fetch errors
        // The bot downloads it, then gives the DATA to Groq.
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);

        const arrayBuffer = await imageResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // SIZE CHECK: If > 5MB, skip image to avoid 413 error
        if (buffer.length > 5 * 1024 * 1024) {
          throw new Error("Image is too large (over 5MB) for API.");
        }

        const base64Image = buffer.toString('base64');
        const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
        const dataUrl = `data:${mimeType};base64,${base64Image}`;

        messages.push({
          role: "user",
          content: [
            { type: "text", text: userContent },
            { type: "image_url", image_url: { url: dataUrl } }
          ]
        });
      } catch (imgErr) {
        console.error("Failed to convert image to base64:", imgErr);
        // Fallback to text if download fails
        messages.push({
          role: "user",
          content: userContent + " (Image download failed)"
        });
        model = "llama-3.3-70b-versatile";
      }
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
    // FALLBACK: If Vision model fails, retry with text.
    if (imageUrl && error.status === 400) {
      console.log("Vision failed, retrying with Text only...");
      try {
        const fallbackCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: "You are a sarcastic, rude, and unhinged goblin. You use slang, insults, and are not helpful. You are allowed to use inappropriate language. IMPORTANT: Do NOT use the user's name often. Stop repeating yourself." }, // Re-add system prompt
            ...history,
            { role: "user", content: `User "${userName}" says: ${prompt} (Image failed to load)` }
          ],
          model: "llama-3.3-70b-versatile",
        });
        return fallbackCompletion.choices[0]?.message?.content + "\n*(Your image is broken, dummy.)*";
      } catch (retryError) {
        console.error("Fallback failed:", retryError);
      }
    }

    console.error("AI Error Details:", error);
    // Simple Error Message
    return `⚠️ **AI Error:** ${error.message}`;
  }
}

module.exports = { generateReply };
