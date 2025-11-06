// pages/EditSnippetPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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
  Lock,
  AlertCircle
} from 'lucide-react';

const EditSnippetPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentSnippet, generateMetadata, updateSnippet, fetchSnippetById, loading } = useSnippet();

  const [code, setCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingSnippet, setLoadingSnippet] = useState(true);
  
  // Editable fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState([]);
  const [language, setLanguage] = useState('');
  const [tags, setTags] = useState([]);
  
  // Additional fields
  const [selectedCollection, setSelectedCollection] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  
  // UI states
  const [newTag, setNewTag] = useState('');
  const [newDescPoint, setNewDescPoint] = useState('');
  const [error, setError] = useState('');

  // Fetch snippet data on mount
  useEffect(() => {
    const loadSnippet = async () => {
      setLoadingSnippet(true);
      await fetchSnippetById(id);
      setLoadingSnippet(false);
    };
    
    if (id) {
      loadSnippet();
    }
  }, [id]);

  // Populate form when snippet loads
  useEffect(() => {
    if (currentSnippet) {
      // Check if user is owner
      if (currentSnippet.user?._id !== user?._id) {
        setError('You are not authorized to edit this snippet');
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      setCode(currentSnippet.code || '');
      setTitle(currentSnippet.title || '');
      setDescription(Array.isArray(currentSnippet.description) ? currentSnippet.description : []);
      setLanguage(currentSnippet.language || '');
      setTags(currentSnippet.tags || []);
      setSelectedCollection(currentSnippet.collection?._id || '');
      setIsPublic(currentSnippet.isPublic || false);
    }
  }, [currentSnippet, user, navigate]);

  const handleRegenerateMetadata = async () => {
    if (!code.trim()) {
      setError('Please enter some code first');
      return;
    }

    setIsGenerating(true);
    setError('');

    const result = await generateMetadata(code);

    if (result.success) {
      // Ask user if they want to replace current data
      if (window.confirm('This will replace your current title, description, language, and tags. Continue?')) {
        setTitle(result.data.title || title);
        setDescription(result.data.description || description);
        setLanguage(result.data.language || language);
        setTags(result.data.tags || tags);
      }
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

  const handleAddDescPoint = () => {
    if (newDescPoint.trim()) {
      setDescription([...description, newDescPoint.trim()]);
      setNewDescPoint('');
    }
  };

  const handleRemoveDescPoint = (index) => {
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
      description,
      language: language.toLowerCase(),
      tags,
      isPublic,
      collection: selectedCollection || null
    };

    const result = await updateSnippet(id, snippetData);

    if (result.success) {
      navigate(`/snippet/${id}`);
    } else {
      setError(result.error || 'Failed to update snippet');
    }
  };

  if (loadingSnippet) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!currentSnippet) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Snippet not found
          </h2>
          <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            Go back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6">
          <Link
            to={`/snippet/${id}`}
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Snippet
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Snippet
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Update your code snippet details
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
                  <h2 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    <Code2 className="w-5 h-5 mr-2" />
                    Your Code
                  </h2>
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
                  placeholder="Paste your code here..."
                  className="w-full h-[600px] p-4 bg-gray-900 dark:bg-gray-950 text-gray-300 font-mono text-sm focus:outline-none resize-none"
                  required
                />
                
                {/* Regenerate Metadata Button */}
                {code.trim() && !isGenerating && (
                  <button
                    type="button"
                    onClick={handleRegenerateMetadata}
                    className="absolute bottom-4 right-4 inline-flex items-center px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors shadow-lg"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Regenerate Metadata
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT SIDE - Metadata (Editable) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Snippet Details
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Edit the details below
                </p>
              </div>

              <div className="p-6 space-y-5 max-h-[600px] overflow-y-auto">
                
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
                    placeholder="Enter snippet title"
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
                    placeholder="e.g., JavaScript"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    disabled={isGenerating}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Description Points
                  </label>
                  
                  {/* Description Points Display */}
                  <div className="space-y-2 mb-2">
                    {description.map((point, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900"
                      >
                        <span className="text-gray-900 dark:text-white text-sm flex-1">• {point}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDescPoint(index)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Description Point Input */}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newDescPoint}
                      onChange={(e) => setNewDescPoint(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDescPoint())}
                      placeholder="Add a description point..."
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      disabled={isGenerating}
                    />
                    <button
                      type="button"
                      onClick={handleAddDescPoint}
                      className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      disabled={isGenerating}
                    >
                      Add
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
                    Collection (Optional)
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
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/snippet/${id}`)}
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
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Update Snippet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSnippetPage;