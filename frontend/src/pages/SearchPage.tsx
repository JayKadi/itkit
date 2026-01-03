import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { articleService } from '../services/articleService';
import  type { Article } from '../types';

interface SearchResponse {
  quickAnswer: string | null;
  sourceArticle: {
    title: string;
    slug: string;
  } | null;
  articles: Article[];
  searchTerm: string;
  totalResults: number;
}

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(query);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      handleSearch(query);
    }
  }, [query]);

  const handleSearch = async (term: string) => {
    if (!term.trim()) return;

    setLoading(true);
    try {
      const response = await articleService.search(term);
      
      if (response.success) {
        setResults(response.data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-8">
        <form onSubmit={handleSubmit}>
          <div className="max-w-3xl mx-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for solutions..."
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>
        </form>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="text-xl text-gray-600">Searching...</div>
        </div>
      )}

      {!loading && results && (
        <>
          {/* Search Info */}
          <div className="mb-6">
            <p className="text-gray-600">
              Found <strong>{results.totalResults}</strong> result
              {results.totalResults !== 1 ? 's' : ''} for "
              <strong>{results.searchTerm}</strong>"
            </p>
          </div>

          {/* Quick Answer */}
          {results.quickAnswer && results.sourceArticle && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⚡</span>
                <h2 className="text-xl font-bold text-gray-800">Quick Answer</h2>
              </div>
              
              <div className="bg-white p-4 rounded border border-blue-100 mb-4">
                <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                  {results.quickAnswer}
                </pre>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Link 
                  to={`/article/${results.sourceArticle.slug}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  📖 Read full guide: {results.sourceArticle.title} →
                </Link>
              </div>
            </div>
          )}

          {/* Search Results */}
          {results.articles.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                📚 All Results
              </h2>
              
              <div className="space-y-6">
                {results.articles.map((article) => {
                  const totalFeedback = article.helpful_count + article.not_helpful_count;
                  const helpfulPercentage = totalFeedback > 0 
                    ? Math.round((article.helpful_count / totalFeedback) * 100)
                    : 0;

                  return (
                    <Link
                      key={article.id}
                      to={`/article/${article.slug}`}
                      className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        {article.category && (
                          <>
                            <span className="text-2xl">{article.category.icon}</span>
                            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              {article.category.name}
                            </span>
                          </>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {article.title}
                      </h3>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {article.content.replace(/<[^>]*>/g, '').substring(0, 200)}...
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
                        <span>⏱️ {article.estimated_read_time} min read</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                No results found
              </h3>
              <p className="text-gray-600 mb-6">
                Try searching for something else or browse categories below
              </p>
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Browse Categories
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;