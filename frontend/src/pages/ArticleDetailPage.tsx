import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { articleService } from '../services/articleService';
import type { Article } from '../types';
import QuickAnswerBox from '../components/articles/QuickAnswerBox';
import FeedbackButtons from '../components/articles/FeedbackButtons';
import RelatedArticles from '../components/articles/RelatedArticles';

const ArticleDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch the article
        const response = await articleService.getBySlug(slug);

        if (response.success && response.data) {
          setArticle(response.data);

          // Fetch related articles from same category
          if (response.data.category) {
            const relatedResponse = await articleService.getAll({
              category: response.data.category.slug,
              limit: 3,
            });

            if (relatedResponse.success && relatedResponse.data) {
              // Filter out current article from related
              const filtered = relatedResponse.data.filter(
                (a: Article) => a.id !== response.data?.id
              );
              setRelatedArticles(filtered.slice(0, 3));
            }
          }
        } else {
          setError('Article not found');
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading article...</div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Article Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'The article you are looking for does not exist.'}
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-blue-600">
          Home
        </Link>
        {article.category && (
          <>
            <span className="mx-2">&gt;</span>
            <Link
              to={`/category/${article.category.slug}`}
              className="hover:text-blue-600"
            >
              {article.category.name}
            </Link>
          </>
        )}
        <span className="mx-2">&gt;</span>
        <span className="text-gray-800">{article.title}</span>
      </div>

      {/* Quick Answer (if exists) */}
      {article.quick_answer && (
        <QuickAnswerBox quickAnswer={article.quick_answer} />
      )}

      {/* Article Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        {article.category && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">{article.category.icon}</span>
            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
              {article.category.name}
            </span>
          </div>
        )}

        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 border-t border-b py-3">
          <span className="flex items-center gap-1">
            👁️ {article.view_count} views
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            ⏱️ {article.estimated_read_time} min read
          </span>
          {article.author && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                ✍️ By {article.author.full_name}
              </span>
            </>
          )}
          <span>•</span>
          <span className="flex items-center gap-1">
            📅 {new Date(article.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Article Content */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>

      {/* Feedback Section */}
      <FeedbackButtons
        articleId={article.id}
        initialHelpfulCount={article.helpful_count}
        initialNotHelpfulCount={article.not_helpful_count}
      />

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <RelatedArticles articles={relatedArticles} />
      )}

      {/* Navigation Buttons */}
      <div className="mt-12 flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          ← Back
        </button>
        <Link
          to="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🏠 Home
        </Link>
      </div>
    </div>
  );
};

export default ArticleDetailPage;