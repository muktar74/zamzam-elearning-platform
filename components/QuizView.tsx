import React, { useState } from 'react';
import { Course, QuizQuestion } from '../types';

interface QuizViewProps {
  course: Course;
  onQuizComplete: (score: number) => void;
}

const QuizView: React.FC<QuizViewProps> = ({ course, onQuizComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
  };
  
  const calculateScore = (finalAnswers: { [key: number]: string }) => {
    let correct = 0;
    course.quiz.forEach((q, index) => {
      if (finalAnswers[index] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / course.quiz.length) * 100);
  };

  const handleNext = () => {
    if (!selectedAnswers[currentQuestionIndex]) return;

    if (currentQuestionIndex < course.quiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Last question: calculate score and finish immediately
      onQuizComplete(calculateScore(selectedAnswers));
    }
  };

  const currentQuestion = course.quiz[currentQuestionIndex];

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">"{course.title}" Quiz</h2>
      <p className="text-slate-500 mb-6">Question {currentQuestionIndex + 1} of {course.quiz.length}</p>
      
      <div className="border-t pt-6">
        <h3 className="text-xl font-semibold text-slate-700 mb-6">{currentQuestion.question}</h3>
        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                selectedAnswers[currentQuestionIndex] === option
                  ? 'bg-zamzam-teal-100 border-zamzam-teal-500 shadow-inner'
                  : 'border-slate-300 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestionIndex}`}
                value={option}
                checked={selectedAnswers[currentQuestionIndex] === option}
                onChange={() => handleAnswerSelect(option)}
                className="w-5 h-5 text-zamzam-teal-600 focus:ring-zamzam-teal-500"
              />
              <span className="ml-4 text-slate-700">{option}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="mt-8 text-right">
        <button
          onClick={handleNext}
          disabled={!selectedAnswers[currentQuestionIndex]}
          className="bg-zamzam-teal-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-zamzam-teal-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {currentQuestionIndex < course.quiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </button>
      </div>
    </div>
  );
};

export default QuizView;