import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { articleService } from '../../services/articleService';
import type { Category } from '../../types';

const EditArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [content, setContent] = useState('');
  const [quickAnswer, setQuickAnswer] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  useEffect(() => {
    const initData = async () => {
      try {
        setFetching(true);
        // 1. Fetch Categories
        const catRes = await categoryService.getAll();
        if (catRes.success && catRes.data) setCategories(catRes.data);

        // 2. Fetch the specific article to edit
        if (id) {
          const artRes = await articleService.getById(id); // Ensure getById exists in your service
          if (artRes.success && artRes.data) {
            const art = artRes.data;
            setTitle(art.title);
            setCategoryId(art.category_id || '');
            setContent(art.content);
            setQuickAnswer(art.quick_answer || '');
            setStatus(art.status);
          }
        }
      } catch (err) {
        setError('Failed to load article data');
      } finally {
        setFetching(false);
      }
    };

    initData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await articleService.update(id, {
        title,
        content,
        quick_answer: quickAnswer || undefined,
        category_id: categoryId || undefined,
        status,
      });

      if (response.success) {
        setSuccess('Article updated successfully!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => navigate('/admin'), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update article');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-10 text-center">Loading article details...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Edit Article</h1>
          <Link to="/admin" className="text-gray-600">← Back</Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {success && <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">✅ {success}</div>}
          {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">❌ {error}</div>}

          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit}>
              {/* Reuse your form fields here exactly like NewArticlePage.tsx */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Content (HTML) *</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm"
                  rows={12}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Quick Answer</label>
                <textarea
                  value={quickAnswer}
                  onChange={(e) => setQuickAnswer(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  rows={4}
                />
              </div>

              <div className="mb-8">
                <label className="block text-gray-700 font-medium mb-2">Status</label>
                <div className="flex gap-6">
                  {['draft', 'published'].map((s) => (
                    <label key={s} className="flex items-center capitalize">
                      <input
                        type="radio"
                        name="status"
                        value={s}
                        checked={status === s}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="mr-2"
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  {loading ? 'Saving...' : 'Update Article'}
                </button>
                <Link to="/admin" className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg">Cancel</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditArticlePage;