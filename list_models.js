require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
    console.log("Checking available models...");

    try {
        // For the older library version, this might be slightly different, but let's try the standard way
        // Note: The library doesn't always expose a direct listModels easily in the high-level helper,
        // so we might need to rely on the error message or try a different approach.
        // However, clean usage of the SDK usually implies asking the model.
        // Let's try to just instantiate a few common ones and see which doesn't crash on a dry run?
        // No, standard API has a list models endpoint.

        // Actually, simply printing the model names that ARE valid is better.
        // The SDK often wraps the REST API.

        // Let's try a direct fetch if the SDK text is obscure, but let's try the SDK method first if it exists.
        // Since I can't be 100% sure of the SDK version installed (despite trying to update), 
        // I will try a simple REST call using the key, which is universally reliable.

        const key = process.env.AI_API_KEY;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.models) {
            console.log("--- AVAILABLE MODELS ---");
            data.models.forEach(m => {
                if (m.name.includes("gemini")) {
                    console.log(m.name.replace("models/", ""));
                }
            });
            console.log("------------------------");
        } else {
            console.error("Could not list models:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
