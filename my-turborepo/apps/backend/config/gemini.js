import { GoogleGenAI, Type } from "@google/genai";

const gemini = async function main(code) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: `
    You are a helpful assistant generating tags and a short description for code snippets.
    Generate:
    1. A suitable title for the code.
    2. A suitable language of the code.
    3. A short description in three bullet points (as an array of 3 strings).
    4. A few relevant tags.
    Code:${code}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
          },
          language: {
            type: Type.STRING,
          },
          description: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
          tags: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
        },
        propertyOrdering: ["title", "language", "description", "tags"],
      },
    },
  });

  const result = JSON.parse(response.text);
  return result;
}

export default gemini;