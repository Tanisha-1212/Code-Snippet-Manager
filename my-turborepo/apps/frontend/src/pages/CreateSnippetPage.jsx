import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSnippet } from '../context/SnippetContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Code2,
  FileText,
  Tag as TagIcon,
  Languages,
  Save,
  X,
  Folder,
  Globe,
  Lock
} from 'lucide-react';

const CreateSnippetPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { generateMetadata, createSnippet, loading } = useSnippet();

  const [code, setCode] = useState('');
  const [generatedData, setGeneratedData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Editable fields from AI
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState([]);
  const [language, setLanguage] = useState('');
  const [tags, setTags] = useState([]);
  
  // Additional fields
  const [selectedCollection, setSelectedCollection] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  
  // UI states
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState('');

  // Auto-generate when code is pasted
  useEffect(() => {
    if (code.trim().length > 20) {
      const timeoutId = setTimeout(() => {
        handleGenerateMetadata();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [code]);

  const handleGenerateMetadata = async () => {
    if (!code.trim()) {
      setError('Please enter some code first');
      return;
    }

    setIsGenerating(true);
    setError('');

    const result = await generateMetadata(code);

    if (result.success) {
      setGeneratedData(result.data);
      setTitle(result.data.title || '');
      setDescription(Array.isArray(result.data.description) ? result.data.description : []);
      setLanguage(result.data.language || '');
      setTags(Array.isArray(result.data.tags) ? result.data.tags : []);
    } else {
      setError(result.error || 'Failed to generate metadata');
    }

    setIsGenerating(false);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleUpdateDescriptionPoint = (index, value) => {
    const newDescription = [...description];
    newDescription[index] = value;
    setDescription(newDescription);
  };

  const handleAddDescriptionPoint = () => {
    setDescription([...description, '']);
  };

  const handleRemoveDescriptionPoint = (index) => {
    setDescription(description.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      setError('Code is required');
      return;
    }

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const snippetData = {
      code: code.trim(),
      title: title.trim(),
      description: description.filter(d => d.trim()),
      language: language.toLowerCase(),
      tags,
      isPublic,
      collection: selectedCollection || null
    };

    const result = await createSnippet(snippetData);

    if (result.success) {
      // Navigate to the appropriate route based on visibility
      if (isPublic) {
        // Public snippet - use the public route
        navigate(`/snippet/${result.data._id}`);
      } else {
        // Private snippet - use the authenticated route
        navigate(`/my-snippet/${result.data._id}`);
      }
    } else {
      setError(result.error || 'Failed to create snippet');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Snippet
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Paste your code and let AI generate the metadata for you
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-between">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button onClick={() => setError('')}>
              <X className="w-5 h-5 text-red-600 dark:text-red-400" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Split Screen Layout */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            
            {/* LEFT SIDE - Code Input */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                  <h1 className="p-3 font-semibold text-gray-900 dark:text-white flex items-center text-center">
                    <Code2 className="w-5 h-5 mr-2" />
                    Your Code
                  </h1>
                  {isGenerating && (
                    <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      AI is analyzing...
                    </div>
                  )}
                </div>
              </div>
              
              <div className="relative">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here...&#10;&#10;AI will automatically generate title, description, language, and tags for you!"
                  className="w-full h-[600px] p-4 bg-gray-900 dark:bg-gray-950 text-gray-300 font-mono text-sm focus:outline-none resize-none"
                  required
                />
                
                {/* Manual Generate Button */}
                {code.trim() && !isGenerating && (
                  <button
                    type="button"
                    onClick={handleGenerateMetadata}
                    className="absolute bottom-4 right-4 inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-lg"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Metadata
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT SIDE - AI Generated Metadata (Editable) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                  AI Generated Metadata
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Review and edit the details below
                </p>
              </div>

              <div className="p-6 space-y-5">
                
                {/* Title */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={isGenerating ? "AI is generating..." : "Enter snippet title"}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    disabled={isGenerating}
                  />
                </div>

                {/* Language */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Languages className="w-4 h-4 mr-2" />
                    Language *
                  </label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder={isGenerating ? "AI is detecting..." : "e.g., JavaScript"}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    disabled={isGenerating}
                  />
                </div>

                {/* Description - Bullet Points */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Description (Bullet Points)
                  </label>
                  
                  <div className="space-y-2">
                    {description.map((point, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-gray-500 dark:text-gray-400 mt-3 text-sm">•</span>
                        <input
                          type="text"
                          value={point}
                          onChange={(e) => handleUpdateDescriptionPoint(index, e.target.value)}
                          placeholder={isGenerating ? "AI is generating..." : "Description point"}
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          disabled={isGenerating}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveDescriptionPoint(index)}
                          className="mt-2 p-1 hover:text-red-600 dark:hover:text-red-400 text-gray-400"
                          disabled={isGenerating}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={handleAddDescriptionPoint}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      disabled={isGenerating}
                    >
                      + Add point
                    </button>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <TagIcon className="w-4 h-4 mr-2" />
                    Tags
                  </label>
                  
                  {/* Tags Display */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 hover:text-blue-900 dark:hover:text-blue-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add Tag Input */}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Add a tag..."
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      disabled={isGenerating}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      disabled={isGenerating}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

                {/* Collection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Folder className="w-4 h-4 mr-2" />
                    Add to Collection (Optional)
                  </label>
                  <select
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">No collection</option>
                    {user?.collections?.map((collection) => (
                      <option key={collection._id} value={collection._id}>
                        {collection.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Public/Private Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Visibility
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPublic(false)}
                      className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        !isPublic
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Lock className="w-4 h-4" />
                      <span className="font-medium">Private</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPublic(true)}
                      className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        isPublic
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      <span className="font-medium">Public</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {isPublic ? 'Anyone can view this snippet' : 'Only you can view this snippet'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isGenerating || !code.trim() || !title.trim()}
              className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Create Snippet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSnippetPage;