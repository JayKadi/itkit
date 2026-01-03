import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { categoryService } from '../services/categoryService';
import type{ Article, Category } from '../types';

interface CategoryResponse {
  category: Category;
  articles: Article[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<CategoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryArticles = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        const response = await categoryService.getArticles(slug);

        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError('Category not found');
        }
      } catch (err) {
        console.error('Error fetching category:', err);
        setError('Failed to load category');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryArticles();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading category...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Category Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'The category you are looking for does not exist.'}
          </p>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const { category, articles, pagination } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-blue-600">
          Home
        </Link>
        <span className="mx-2">&gt;</span>
        <span className="text-gray-800">{category.name}</span>
      </div>

      {/* Category Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-6xl">{category.icon}</span>
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-gray-600">{category.description}</p>
            )}
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <p className="text-gray-600">
            <strong>{pagination.total}</strong> article{pagination.total !== 1 ? 's' : ''} in this category
          </p>
        </div>
      </div>

      {/* Articles Grid */}
      {articles.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            All Articles
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => {
              const totalFeedback = article.helpful_count + article.not_helpful_count;
              const helpfulPercentage = totalFeedback > 0 
                ? Math.round((article.helpful_count / totalFeedback) * 100)
                : 0;

              return (
                <Link
                  key={article.id}
                  to={`/article/${article.slug}`}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {article.title}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {article.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>👁️ {article.view_count} views</span>
                    {totalFeedback > 0 && (
                      <>
                        <span>|</span>
                        <span>👍 {helpfulPercentage}% helpful</span>
                      </>
                    )}
                    <span>|</span>
                    <span>⏱️ {article.estimated_read_time} min</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            No articles yet
          </h3>
          <p className="text-gray-600">
            Articles in this category will appear here.
          </p>
        </div>
      )}

      {/* Back Button */}
      <div className="mt-12">
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default CategoryPage;