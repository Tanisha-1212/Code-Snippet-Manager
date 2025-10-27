import Snippet from '../models/Snippet.js';
import User from '../models/User.js';

import gemini from "../config/gemini.js";

/**
 * Create a new snippet with AI-generated description and tags
 */
export const createSnippet = async (req, res) => {
  try {
    // --- Extract code from JSON or raw text ---
    const code = req.body.code || req.body;

    if (!code || (typeof code === 'object' && !code.code)) {
      return res.status(400).json({ message: "Code is required" });
    }

    // Ensure code is a string
    let codeString = typeof code === 'string' ? code : code.code;


    // --- Call Gemini AI ---
    const aiResponse = await gemini(codeString);

    // --- Safely parse AI response ---
    let data = [];
    try {
      data = JSON.parse(aiResponse);
      if (!Array.isArray(data) || data.length === 0) throw new Error("Empty AI response");
    } catch (error) {
      console.error("AI output is not valid JSON:", aiResponse);
      return res.status(400).json({ error: "Invalid AI response format" });
    }

    // --- Extract fields safely ---
    const { title = "", language = "", description = [], tags = [] } = data[0] || {};


    // --- Create snippet in DB ---
    const newSnippet = await Snippet.create({
      title,
      code: codeString,          // original code preserved
      language,
      description,
      tags,
      user: req.user.id,
    });

    // --- Add snippet reference to user ---
    await User.findByIdAndUpdate(req.user.id, {
      $push: { snippets: newSnippet._id },
    });

    res.status(201).json({
      message: "Snippet created successfully",
      snippet: newSnippet,
    });

  } catch (error) {
    console.error("Error creating snippet:", error);
    res.status(500).json({ message: error.message });
  }
};



export const getAllSnippets = async(req, res) => {
    try {
        const userId = req.user.id;

        const snippets = await Snippet.find({user: userId}).sort({createdAt : -1});

        res.status(200).json(snippets);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const getSnippetById = async(req, res) => {
    try {
        const snippet = await Snippet.findById(req.params.id);
        if(!snippet) return res.status(404).json({message: "Snippet not found"});

        if(snippet.user.toString() !== req.user.id)
            return res.status(403).json({message: "Access denied"});

        res.json(snippet);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

export const updateSnippet = async(req, res) => {
    try {
        const snippet = await Snippet.findById(req.params.id);
        if(!snippet) return res.status(404).json({message: "Snippet not found"});

        if(snippet.user.toString() !== req.user.id)
            return res.status(403).json({message: "Access denied"});

        const { title, code, language, description, tags } = req.body;

        snippet.title = title || snippet.title;
        snippet.code = code || snippet.code;
        snippet.language = language || snippet.language;
        snippet.description = description || snippet.description;
        snippet.tags = tags || snippet.tags;

        const updatedSnippet = await snippet.save();
        res.json({message: "Snippet updated successfully", snippet: updatedSnippet});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};


export const deleteSnippet = async(req, res) => {
    try {
        const snippet = await Snippet.findById(req.params.id);
        if(!snippet) return res.status(404).json({message : "Snippet not found"});

        if(snippet.user.toString() !== req.user.id)
            return res.status(403).json({message: "Access denied"});

        await snippet.deleteOne();
        await User.findByIdAndUpdate(req.user.id, {$pull: {snippets:snippet._id}});

        res.json({message: "Snippet deleted Successfully"});
    } catch (error) {
        res.status(404).json({message: error.message});
    }
};

export const togglePublicSnippet = async(req, res) => {
    try {
        const snippet = await Snippet.findById(req.params.id);
        if (!snippet) return res.status(404).json({message : "Snippet not found"});

        if(snippet.user.toString() !== req.user.id)
            return res.status(403).json({message : "Access denied"});

        snippet.isPublic = !snippet.isPublic;
        await snippet.save();

        res.json({
            message: `Snippet is now ${snippet.isPublic ? "public" : "private"}`,
            snippet
        })
    } catch (error) {
        res.status(404).json({message: error.message});
    }
};

export const getPublicSnippets = async(req, res) => {
    try {
        const snippets = await Snippet.find({isPublic: true}).populate('user', 'username profilePic');
        res.json(snippets);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

export const searchUserSnippet = async(req, res) => {
    try {
        const {query} = req.query;
        const userId = req.user.id;

        if(!query) return res.status(400).json({message: "Query is required"});

        const snippets = await Snippet.find({
            user: userId,
            $or: [
                {title: {$regex: query, $options: 'i'}},
                {tags: {$regex: query, $options: 'i'}}
            ]
        });

        res.json({snippets});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

export const searchPublicSnippets = async(req, res) =>{
    try {
        const {query} = req.query;

        if(!query) return res.status(400).json({message: "Query is required"});

        const snippets = await Snippet.find({
         isPublic: true,
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { tags: { $regex: query, $options: 'i' } }
            ]
        }).populate('user', 'username profilePic');
        res.json({snippets});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

