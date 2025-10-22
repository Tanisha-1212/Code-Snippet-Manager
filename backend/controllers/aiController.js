import openai from "../config/openai.js";

export const generateSnippetAi = async(code) => {
    try {
        const response = await openai.chat.completions.create({
            model : "gpt-4o-mini",
            messages: [
                {
                    role : "system",
                    content : "You are a helpful assistant generating tags and a short description for code snippets."
                },
                {
                    role : "user",
                    content : `Generate tags and a short description for this code:\n\n${code}`
                }
            ]
        });

        const aiResult = response.choices[0].message.content;

        const lines = aiResult.split("\n").map(s => s.trim()).filter(Boolean);
        const tags = lines;

        return {description, tags};
    } catch (error) {
        console.log("OpenAI API error", error);
        return {description : "", tags : []};
    }
};