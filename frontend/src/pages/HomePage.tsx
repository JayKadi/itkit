import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articleService } from '../services/articleService';
import { categoryService } from '../services/categoryService';
import type { Article, Category } from '../types';

const HomePage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesRes, categoriesRes] = await Promise.all([
          articleService.getAll({ limit: 10 }),
          categoryService.getAll(),
        ]);

        if (articlesRes.success && articlesRes.data) {
          setArticles(articlesRes.data);
        }

        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to ITKit 🧰
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Your IT knowledge base for quick solutions
        </p>
        <div className="max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search for solutions..."
            className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-center"
            >
              <div className="text-4xl mb-2">{category.icon}</div>
              <div className="font-semibold text-gray-800">{category.name}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Articles */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Articles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/article/${article.slug}`}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
            >
              <div className="flex items-center gap-2 mb-3">
                {article.category && (
                  <span className="text-2xl">{article.category.icon}</span>
                )}
                <span className="text-sm text-gray-500">
                  {article.category?.name || 'Uncategorized'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {article.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>👁️ {article.view_count} views</span>
                <span>⏱️ {article.estimated_read_time} min read</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;