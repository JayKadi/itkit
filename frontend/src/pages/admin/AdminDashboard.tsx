import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Article } from '../../types';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState(''); // Filter state
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalViews: 0,
    avgHelpfulRate: 0,
  });
  const [loading, setLoading] = useState(true);

  // 1. Date Formatting Helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // 2. Search/Filter Logic
  const filteredArticles = useMemo(() => {
    return articles.filter(article => 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [articles, searchTerm]);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/articles?status=all&limit=100');
      
      if (response.data.success) {
        const articlesData = response.data.data || [];
        setArticles(articlesData);
        
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
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.delete(`/articles/${id}`);
      alert('Article deleted successfully!');
      fetchArticles();
    } catch (error) {
      alert('Failed to delete article.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">🧰 ITKit Admin</h1>
          <Link to="/" className="text-gray-600 hover:text-gray-800">← Back to Site</Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Articles" value={stats.totalArticles} icon="📚" />
          <StatCard title="Total Views" value={stats.totalViews} icon="👁️" />
          <StatCard title="Avg. Helpful Rate" value={`${stats.avgHelpfulRate}%`} icon="👍" />
        </div>

        {/* 3. Search & Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <Link
            to="/admin/new-article"
            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center font-medium"
          >
            ➕ Create New Article
          </Link>

          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Filter by title or category..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stats</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredArticles.map((article) => {
                const totalFeedback = article.helpful_count + article.not_helpful_count;
                const helpfulRate = totalFeedback > 0 ? Math.round((article.helpful_count / totalFeedback) * 100) : 0;

                return (
                  <tr key={article.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{article.title}</div>
                      <div className="text-xs text-gray-400">Updated: {formatDate(article.updated_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{article.category?.icon} {article.category?.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={article.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>👁️ {article.view_count} views</div>
                      <div className={helpfulRate >= 70 ? 'text-green-600' : ''}>👍 {helpfulRate}% helpful</div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        {/* 4. Edit Button */}
                        <button 
                          onClick={() => navigate(`/admin/edit-article/${article.id}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <Link to={`/article/${article.slug}`} className="text-blue-600 hover:text-blue-900" target="_blank">
                          View
                        </Link>
                        <button onClick={() => handleDelete(article.id, article.title)} className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredArticles.length === 0 && (
            <div className="text-center py-12 text-gray-500">No articles found matching your search.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Components for cleaner JSX
const StatCard = ({ title, value, icon }: { title: string, value: any, icon: string }) => (
  <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
    <div>
      <p className="text-gray-600 text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
    <div className="text-4xl">{icon}</div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const colors: any = {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-yellow-100 text-yellow-800',
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

export default AdminDashboard;