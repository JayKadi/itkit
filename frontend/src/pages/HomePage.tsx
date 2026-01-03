import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { articleService } from '../services/articleService';
import { categoryService } from '../services/categoryService';
import type { Article, Category } from '../types';

const HomePage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  // Fetch initial data
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

  // Live search as user types
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        handleSearch(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearch = async (term: string) => {
    setSearching(true);
    try {
      const response = await articleService.search(term);
      
      if (response.success && response.data.articles) {
        setSearchResults(response.data.articles);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // If user is searching, show search results
  const displayArticles = searchTerm.trim().length >= 2 ? searchResults : articles;
  const isSearching = searchTerm.trim().length >= 2;

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
        
        {/* Search Bar with Live Results */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for solutions... (e.g., VPN, password, printer)"
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              
              {/* Loading spinner or search icon */}
              {searching ? (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
            </div>
          </form>
          
          {/* Search hint */}
          {searchTerm.trim().length > 0 && searchTerm.trim().length < 2 && (
            <p className="text-sm text-gray-500 mt-2 text-left">
              Type at least 2 characters to search...
            </p>
          )}
        </div>
      </div>

      {/* Categories */}
      {!isSearching && (
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
      )}

      {/* Articles - Recent or Search Results */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {isSearching 
            ? `Search Results (${displayArticles.length} found)` 
            : 'Recent Articles'
          }
        </h2>

        {displayArticles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayArticles.map((article) => (
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
        ) : isSearching ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No results found
            </h3>
            <p className="text-gray-600 mb-6">
              Try different keywords or browse categories above
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Clear Search
            </button>
          </div>
        ) : null}

        {/* View all results link for searches */}
        {isSearching && displayArticles.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              to={`/search?q=${encodeURIComponent(searchTerm)}`}
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              View detailed search results with quick answers →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;