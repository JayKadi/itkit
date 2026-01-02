import { Link } from 'react-router-dom';
import type { Article } from '../../types';

interface RelatedArticlesProps {
  articles: Article[];
}

const RelatedArticles = ({ articles }: RelatedArticlesProps) => {
  if (articles.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        📚 Related Articles
      </h3>

      <div className="grid md:grid-cols-3 gap-6">
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

            <h4 className="text-lg font-bold text-gray-800 mb-2">
              {article.title}
            </h4>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>👁️ {article.view_count} views</span>
              <span>⏱️ {article.estimated_read_time} min</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedArticles;