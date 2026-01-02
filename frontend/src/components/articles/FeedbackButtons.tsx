import { useState } from 'react';
import api from '../../services/api';

interface FeedbackButtonsProps {
  articleId: string;
  initialHelpfulCount: number;
  initialNotHelpfulCount: number;
}

const FeedbackButtons = ({
  articleId,
  initialHelpfulCount,
  initialNotHelpfulCount,
}: FeedbackButtonsProps) => {
  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount);
  const [notHelpfulCount, setNotHelpfulCount] = useState(initialNotHelpfulCount);
  const [voted, setVoted] = useState(false);
  const [problemSolved, setProblemSolved] = useState(false);

  const handleFeedback = async (isHelpful: boolean) => {
    if (voted) return;

    try {
      await api.post('/feedback/helpful', {
        article_id: articleId,
        is_helpful: isHelpful,
      });

      if (isHelpful) {
        setHelpfulCount(helpfulCount + 1);
      } else {
        setNotHelpfulCount(notHelpfulCount + 1);
      }
      
      setVoted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleProblemSolved = async () => {
    try {
      await api.post('/feedback/ticket-prevented', {
        article_id: articleId,
      });
      
      setProblemSolved(true);
    } catch (error) {
      console.error('Error marking as solved:', error);
    }
  };

  const totalVotes = helpfulCount + notHelpfulCount;
  const helpfulPercentage = totalVotes > 0 
    ? Math.round((helpfulCount / totalVotes) * 100) 
    : 0;

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Was this article helpful?
      </h3>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => handleFeedback(true)}
          disabled={voted}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition ${
            voted
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          👍 Helpful {helpfulCount > 0 && `(${helpfulCount})`}
        </button>

        <button
          onClick={() => handleFeedback(false)}
          disabled={voted}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition ${
            voted
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          👎 Not Helpful {notHelpfulCount > 0 && `(${notHelpfulCount})`}
        </button>
      </div>

      {voted && (
        <p className="text-sm text-gray-600 mb-4">
          Thanks for your feedback! {helpfulPercentage}% found this helpful.
        </p>
      )}

      <div className="border-t pt-4">
        <h4 className="text-md font-semibold text-gray-800 mb-3">
          ✅ Did this solve your problem?
        </h4>
        
        <div className="flex gap-4">
          <button
            onClick={handleProblemSolved}
            disabled={problemSolved}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              problemSolved
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {problemSolved ? '✓ Marked as solved!' : 'Yes, problem solved!'}
          </button>

          <a
            href="mailto:itsupport@jumia.co.ke"
            className="flex-1 py-2 px-4 rounded-lg font-medium text-center bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            No, I need help
          </a>
        </div>
      </div>
    </div>
  );
};

export default FeedbackButtons;