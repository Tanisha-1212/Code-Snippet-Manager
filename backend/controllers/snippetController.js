const Snippet = require('../models/Snippet');
const User = require('../models/User');

export const createSnippet = async(req, res) => {
    try {
        const {title, code, language} = req.body;

        if(!title || !code){
            return res.status(400).json({message: "Title and code are required"});
        }

        const newSnippet = await Snippet.create({
            title, 
            code,
            language,
            user: req.user.id
        });

        await User.findByIdAndUpdate(req.user.id, {
            $push: {snippets : newSnippet._id}
        });

        res.status(201).json({message: "Snippet created successfully"});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

export const getSnippetById = async(req, res) => {
    try {
        const snippet = await Snippet.findById(req.params.id);
        if(!snippet) return res.status(404).json({message: "Snippetnot found"});

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
            return res.staus(500).json({message: "Access denied"});

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

        res.json(snippets);
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
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

