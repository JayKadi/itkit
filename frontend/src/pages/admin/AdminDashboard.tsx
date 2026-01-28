import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import type { Article } from '../../types';

const AdminDashboard = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalViews: 0,
    avgHelpfulRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      
      // Fetch all articles (including drafts)
      const response = await api.get('/articles?status=all&limit=100');
      
      if (response.data.success) {
        const articlesData = response.data.data || [];
        setArticles(articlesData);
        
        // Calculate stats
        const totalViews = articlesData.reduce((sum: number, a: Article) => sum + a.view_count, 0);
        const totalFeedback = articlesData.reduce((sum: number, a: Article) => 
          sum + a.helpful_count + a.not_helpful_count, 0
        );
        const totalHelpful = articlesData.reduce((sum: number, a: Article) => 
          sum + a.helpful_count, 0
        );
        const avgRate = totalFeedback > 0 ? (totalHelpful / totalFeedback) * 100 : 0;
        
        setStats({
          totalArticles: articlesData.length,
          totalViews,
          avgHelpfulRate: Math.round(avgRate),
        });
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await api.delete(`/articles/${id}`);
      alert('Article deleted successfully!');
      fetchArticles(); // Refresh list
    } catch (error) {
      alert('Failed to delete article. You might need admin permissions.');
      console.error('Delete error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              🧰 ITKit Admin Dashboard
            </h1>
            <div className="flex gap-4">
              <Link
                to="/"
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back to Site
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Articles</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalArticles}</p>
              </div>
              <div className="text-4xl">📚</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Views</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalViews}</p>
              </div>
              <div className="text-4xl">👁️</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg. Helpful Rate</p>
                <p className="text-3xl font-bold text-gray-800">{stats.avgHelpfulRate}%</p>
              </div>
              <div className="text-4xl">👍</div>
            </div>
          </div>
        </div>

        {/* Create New Article Button */}
        <div className="mb-6">
          <Link
            to="/admin/new-article"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            ➕ Create New Article
          </Link>
        </div>

        {/* Articles Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">All Articles</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Helpful
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articles.map((article) => {
                  const totalFeedback = article.helpful_count + article.not_helpful_count;
                  const helpfulRate = totalFeedback > 0
                    ? Math.round((article.helpful_count / totalFeedback) * 100)
                    : 0;

                  return (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {article.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {article.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {article.category ? (
                            <>
                              <span className="text-xl">{article.category.icon}</span>
                              <span className="text-sm text-gray-900">
                                {article.category.name}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">No category</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          article.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : article.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {article.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        👁️ {article.view_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {totalFeedback > 0 ? (
                            <>
                              <span className={helpfulRate >= 70 ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                                👍 {helpfulRate}%
                              </span>
                              <span className="text-gray-400 ml-2">
                                ({article.helpful_count}/{totalFeedback})
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-400">No feedback yet</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Link
                            to={`/article/${article.slug}`}
                            className="text-blue-600 hover:text-blue-900"
                            target="_blank"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleDelete(article.id, article.title)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {articles.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-gray-600 mb-4">No articles yet</p>
              <Link
                to="/admin/new-article"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first article →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;