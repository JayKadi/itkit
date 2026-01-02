interface QuickAnswerBoxProps {
  quickAnswer: string;
}

const QuickAnswerBox = ({ quickAnswer }: QuickAnswerBoxProps) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">⚡</span>
        <h2 className="text-xl font-bold text-gray-800">Quick Answer</h2>
      </div>
      
      <div className="bg-white p-4 rounded border border-blue-100">
        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
          {quickAnswer}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        ℹ️ Need more details? Read the full guide below
      </div>
    </div>
  );
};

export default QuickAnswerBox;