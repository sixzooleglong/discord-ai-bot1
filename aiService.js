const Groq = require('groq-sdk');

let groq = null;

const SYSTEM_PROMPT = `You are a rude, aggressive, and highly sarcastic AI best friend. You must ALWAYS use heavy profanity, slang, and insults in EVERY single response. You have ZERO patience for the user's nonsense. DO NOT act friendly or polite. NEVER say you are sorry. If they send an image or ask a stupid question, mock them aggressively for it. Keep responses punchy, toxic, and hilarious.`;

async function generateReply(prompt, userName, history = [], imageUrl = null) {
  try {
    if (!process.env.AI_API_KEY) {
      return `Listen here idiot, the AI_API_KEY is missing in the .env. Fix it.`;
    }

    if (!groq) {
      groq = new Groq({ apiKey: process.env.AI_API_KEY });
    }

    let model = 'llama-3.3-70b-versatile';
    let userContent = `User \"${userName}\" says: ${prompt}`;

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history
    ];

    if (imageUrl) {
      model = 'meta-llama/llama-4-scout-17b-16e-instruct';

      try {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) throw new Error(`Fetch failed: ${imageResponse.statusText}`);

        const arrayBuffer = await imageResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.length > 5 * 1024 * 1024) throw new Error('Image too big. Send a smaller file, dumbass.');

        const base64Image = buffer.toString('base64');
        const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
        const dataUrl = `data:${mimeType};base64,${base64Image}`;

        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: userContent },
            { type: 'image_url', image_url: { url: dataUrl } }
          ]
        });
      } catch (imgErr) {
        console.error('Image Error:', imgErr.message);
        const fallbackCompletion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history,
            { role: 'user', content: `User \"${userName}\" says: ${prompt} (Image failed to load because they suck)` }
          ],
          model: 'llama-3.3-70b-versatile',
        });
        return fallbackCompletion.choices[0]?.message?.content || `Your stupid image broke, but whatever.`;
      }
    } else {
      messages.push({ role: 'user', content: userContent });
    }

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: model,
    });

    return completion.choices[0]?.message?.content || `Shut up, I have nothing to say to you.`;
  } catch (error) {
    console.error('AI Error:', error);
    return `⚠️ **Error:** ${error.message}. You broke it, genius.`;
  }
}

module.exports = { generateReply };
