
import { GoogleGenAI } from "@google/genai";
import { StyleOption } from "../types";

// Initialize the client with the environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a virtually staged image based on an input image, style, and guidelines.
 * 
 * @param base64Image The raw base64 string of the uploaded image.
 * @param style The selected style object containing type and optional custom prompt.
 * @param guidelines Optional user provided text guidelines.
 * @returns The base64 string of the generated image.
 */
export const generateStagedImage = async (
  base64Image: string,
  style: StyleOption,
  guidelines: string
): Promise<string> => {
  try {
    // 1. Detect MIME type dynamically
    const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    // 2. Clean the base64 string (remove header)
    const cleanBase64 = base64Image.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    let prompt = '';

    // Construct a highly structured prompt to force transformation
    if (style.customPrompt) {
        // If it looks like JSON (starts with {), treat it as a technical configuration
        if (style.customPrompt.trim().startsWith('{')) {
             prompt = `
[TASK]
Virtually stage the interior of this room based STRICTLY on the following JSON configuration.

[CONFIGURATION]
${style.customPrompt}

[INSTRUCTIONS]
- Analyze the JSON "staging_content" for furniture, palette, and decor.
- Analyze the "preservation_rules" to understand constraints.
- Analyze "technical_rendering" for lighting mood.
- GENERATE a photorealistic image adhering to these rules.
${guidelines ? `[USER NOTES]\n${guidelines}` : ''}
`;
        } else {
            // Text-based custom prompt (e.g. Hero Shot)
            prompt = `
[TASK]
Transform the input image based on the following specifications.

[SPECIFICATION]
${style.customPrompt}

${guidelines ? `[USER GUIDELINES]\n${guidelines}` : ''}

[OUTPUT]
Photorealistic, high-resolution image.
`;
        }
    } else if (style.type === 'exterior') {
      prompt = `
[TASK]
Act as a professional architectural visualizer. Redesign this property exterior.

[STYLE]
${style.name}: ${style.description}

[DIRECTIVES]
- Enhance lighting, landscaping, and materials to match the style.
- Keep the main structural geometry intact.
- Make it look like a high-end real estate photograph.
${guidelines ? `- User Note: ${guidelines}` : ''}
`;
    } else {
      prompt = `
[TASK]
Act as a professional interior designer. Virtually stage this room.

[STYLE]
${style.name}: ${style.description}

[DIRECTIVES]
- Furnish the room realistically.
- Keep the floor, walls, and windows in the same position.
- Ensure realistic lighting and shadows.
${guidelines ? `- User Note: ${guidelines}` : ''}
`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          // For image editing/transformation, passing the image first provides the context
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        // System instruction helps enforce the "Editor" persona
        systemInstruction: "You are an expert Real Estate Virtual Staging AI. Your goal is to GENERATE a modified version of the input image that matches the requested style. Do not describe the image. You must output a new image.",
      }
    });

    // Extract the image from the response
    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          // Return the full data URI
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("The AI processed the request but returned text instead of an image. Please try again with slightly different guidelines.");

  } catch (error) {
    console.error("Gemini Staging Error:", error);
    throw error;
  }
};

/**
 * Refines an existing generated image based on specific user edits.
 * 
 * @param imageBase64 The base64 string of the image to edit (usually the generated one).
 * @param instructions Text description of what to change.
 */
export const refineGeneratedImage = async (
  imageBase64: string,
  instructions: string
): Promise<string> => {
  try {
    const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    const prompt = `
[TASK]
Edit this image based strictly on the user's adjustment instructions.

[INSTRUCTIONS]
${instructions}

[CONSTRAINTS]
- Keep the overall style and composition identical to the input image.
- Only modify the specific elements mentioned in the instructions.
- Ensure seamless blending and photorealism.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        systemInstruction: "You are a professional photo editor. Your task is to apply specific adjustments to the provided image while maintaining photorealism.",
      }
    });

    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("Failed to refine image.");
  } catch (error) {
    console.error("Refinement Error:", error);
    throw error;
  }
};
