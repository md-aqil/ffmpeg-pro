const { OpenAI } = require("openai");
const fs = require("fs");
const path = require("path");

const client = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY || "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"
});

/**
 * Analyzes an image using NVIDIA's AI model to generate metadata.
 * @param {string} filePath - Path to the image file.
 * @returns {Promise<Object>} - Object containing filename, title, altText, and description.
 */
const analyzeImage = async (filePath) => {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString("base64");
    const extension = path.extname(filePath).slice(1) || "png";
    const mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;

    const prompt = `Analyze this image and provide the following metadata in JSON format:
    1. suggestedFilename: A SEO-friendly filename (slug) without extension.
    2. title: A concise title for the image.
    3. altText: A descriptive ALT text for accessibility.
    4. description: A detailed description of the image content.
    
    Respond ONLY with the JSON object.`;

    const completion = await client.chat.completions.create({
      model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 1024,
    });

    const responseText = completion.choices[0].message.content;
    
    // Clean up potential markdown formatting if the model wraps JSON in code blocks
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return JSON.parse(responseText);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new Error("Failed to analyze image with AI.");
  }
};

module.exports = {
  analyzeImage,
};
