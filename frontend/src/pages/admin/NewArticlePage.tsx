import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { articleService } from '../../services/articleService';
import type { Category } from '../../types';

const NewArticlePage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Form state
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [content, setContent] = useState('');
  const [quickAnswer, setQuickAnswer] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await articleService.create({
        title,
        content,
        quick_answer: quickAnswer || undefined,
        category_id: categoryId || undefined,
        status,
      });

      if (response.success) {
        setSuccess('Article created successfully!');
        
        // Reset form
        setTitle('');
        setContent('');
        setQuickAnswer('');
        setCategoryId('');
        setStatus('published');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              Create New Article
            </h1>
            <Link
              to="/admin"
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              ✅ {success} Redirecting to dashboard...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              ❌ {error}
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., How to Connect to VPN"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Content (HTML) *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="<h2>Article Title</h2>&#10;<p>Article content...</p>"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-sm"
                  rows={12}
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  💡 Use HTML tags: &lt;h2&gt;, &lt;p&gt;, &lt;ol&gt;, &lt;ul&gt;, &lt;li&gt;
                </p>
              </div>

              {/* Quick Answer */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Quick Answer (Optional)
                </label>
                <textarea
                  value={quickAnswer}
                  onChange={(e) => setQuickAnswer(e.target.value)}
                  placeholder="1. Step one&#10;2. Step two&#10;3. Step three"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  rows={6}
                />
                <p className="text-sm text-gray-500 mt-2">
                  💡 Shows at top of article for quick solutions
                </p>
              </div>

              {/* Status */}
              <div className="mb-8">
                <label className="block text-gray-700 font-medium mb-2">
                  Status *
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={status === 'draft'}
                      onChange={(e) => setStatus(e.target.value as 'draft')}
                      className="mr-2"
                    />
                    <span>Draft</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={status === 'published'}
                      onChange={(e) => setStatus(e.target.value as 'published')}
                      className="mr-2"
                    />
                    <span>Published</span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 font-medium"
                >
                  {loading ? 'Creating...' : 'Create Article'}
                </button>
                <Link
                  to="/admin"
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>

          {/* HTML Template */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-800 mb-4">📝 HTML Template</h3>
            <pre className="bg-white p-4 rounded border text-sm overflow-x-auto">
{`<h2>How to Connect to VPN</h2>
<p>Follow these steps:</p>

<ol>
  <li>Open VPN client</li>
  <li>Enter credentials</li>
  <li>Click Connect</li>
</ol>

<h3>Troubleshooting</h3>
<ul>
  <li>Check internet connection</li>
  <li>Verify credentials</li>
</ul>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewArticlePage;