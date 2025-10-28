import gemini from "../config/gemini.js";

/**
 * Controller to generate code snippet description and tags using Gemini
 */
export const generateSnippet = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Code snippet is required." });
    }

    // --- Call Gemini ---
    const aiResponse = await gemini(code);

    // --- Process Gemini response ---
    let data;
    try {
      data = JSON.parse(aiResponse);
    } catch (error) {
      console.error("AI output is not valid JSON:", aiResponse);
      return res.status(400).json({ error: "Invalid AI response format" });
    }

    if(!data[0].title) return res.status(404).json({message : "Error fetching title"});

    // Access description & tags
    const title = data[0]?.title || "";
    const language = data[0]?.language || "";
    const description = data[0]?.description || [];
    const tags = data[0]?.tags || [];



    // --- Respond to client ---
    res.status(200).json({
      title : title,
      language : language,
      description : description,
      tags: tags,
    });
  } catch (error) {
    console.error("Gemini AI error:", error);
    res.status(500).json({
      message: "Gemini AI error",
      error: error.message,
    });
  }
};
