import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({});

const gemini = async function main(code) {

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents:`
    You are a helpful assistant generating tags and a short description for code snippets.
    Generate:
    1. A suitable title for the code.
    2. A suitable language of the code.
    3. A short description in three bullet points.
    4. A few relevant tags (one per line).
    Code:${code}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title : {
              type: Type.STRING,
            },
            language : {
              type : Type.STRING,
            },
            description: {
              type: Type.ARRAY,
              items:{
                type : Type.STRING,
              }
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
    },
  });

  return response.text;
}

export default gemini;
