import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import GameHeader from "@/components/game/GameHeader";
import MochiAvatar from "@/components/game/MochiAvatar";
import AnswerCard from "@/components/game/AnswerCard";
import FeedbackOverlay from "@/components/game/FeedbackOverlay";
import VoiceRecorder from "@/components/game/VoiceRecorder";

import {
  Question,
  QuestionOption,
  fetchQuestions,
  fetchGeminiFeedback,
  GeminiFeedback,
} from "@/lib/mockData";

// --- INTERFACES ---
interface SavedGame {
  id: string;
  name: string; // Changed 'title' to 'name' to match your storage logic
  description: string;
  questions: {
    questionText: string; // Changed to match your CreateActivity state
    options: { label: string; image: string | null }[];
  }[];
  createdAt: string;
}

/** * Convert a saved game's questions into the Question format used by the game engine 
 * This ensures your custom "car" game works with the Mochi UI
 */
const convertSavedGameQuestions = (savedGame: any): Question[] => {
  return savedGame.questions.map((q: any, idx: number) => {
    // The correct answer is assumed to be the first option provided
    const correctAnswer = q.options[0]?.label || "Unknown";
    return {
      id: idx + 1,
      category_id: -1,
      target_item: q.questionText || correctAnswer,
      correct_answer: correctAnswer,
      options: q.options.map((opt: any, optIdx: number) => ({
        id: optIdx + 1,
        label: opt.label,
        image_url: opt.image || `https://placehold.co/300x300/e2e8f0/64748b?text=${encodeURIComponent(opt.label)}`,
      })),
    };
  });
};

const GamePage = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<QuestionOption | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<GeminiFeedback | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!categoryId) return;

      // 1. Check localStorage for user-created games
      const savedGamesRaw = localStorage.getItem("created_games");
      const savedGames = savedGamesRaw ? JSON.parse(savedGamesRaw) : [];
      
      // Look for a game matching the current ID from the URL
      const localGame = savedGames.find((g: any) => g.id.toString() === categoryId);

      if (localGame) {
        // Format the local data for the game engine
        const convertedQuestions = convertSavedGameQuestions(localGame);
        setQuestions(convertedQuestions);
        setIsLoading(false);
      } else {
        // 2. Fallback: Fetch from default categories (Fruits, Numbers, etc.)
        try {
          // Preset IDs are numbers (1, 2, 3)
          const data = await fetchQuestions(parseInt(categoryId));
          setQuestions(data);
        } catch (error) {
          console.error("Failed to load mock questions:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadQuestions();
  }, [categoryId]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectOption = async (option: QuestionOption) => {
    if (showFeedback) return;
    
    setSelectedOption(option);
    
    // Get AI feedback from Gemini API
    const result = await fetchGeminiFeedback(
      option.label,
      currentQuestion.correct_answer,
      currentQuestion.target_item
    );
    
    setFeedback(result);
    
    if (result.isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setShowFeedback(true);
  };

  const handleVoiceInput = async (transcript: string) => {
    const matchingOption = currentQuestion.options.find(
      opt => opt.label.toLowerCase() === transcript.toLowerCase()
    );
    
    if (matchingOption) {
      handleSelectOption(matchingOption);
    } else {
      const result = await fetchGeminiFeedback(
        transcript,
        currentQuestion.correct_answer,
        currentQuestion.target_item
      );
      setFeedback(result);
      setShowFeedback(true);
    }
  };

  const handleContinue = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
      setFeedback(null);
    } else {
      // Return to gallery with score summary
      navigate("/revision-games", { state: { score, total: questions.length } });
    }
  };

  const handleRetry = () => {
    setSelectedOption(null);
    setShowFeedback(false);
    setFeedback(null);
  };

  const handleEnd = () => {
    navigate("/revision-games");
  };

  const handleNext = () => {
    if (selectedOption && feedback?.isCorrect) {
      handleContinue();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No questions available</h2>
          <button
            onClick={() => navigate("/revision-games")}
            className="text-primary underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col">
      <GameHeader
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        onEnd={handleEnd}
        onNext={handleNext}
        canProceed={!!feedback?.isCorrect}
      />

      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 py-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-shrink-0"
        >
          <MochiAvatar
            message={`Can you show me the ${currentQuestion.target_item}?`}
            mood="happy"
            size="lg"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="grid grid-cols-3 gap-4">
            {currentQuestion.options.map((option) => (
              <AnswerCard
                key={option.id}
                option={option}
                onSelect={handleSelectOption}
                isSelected={selectedOption?.id === option.id}
                isCorrect={option.label === currentQuestion.correct_answer}
                isRevealed={showFeedback}
              />
            ))}
          </div>

          <div className="mt-4">
            <VoiceRecorder
              onRecordingComplete={handleVoiceInput}
              isDisabled={showFeedback}
            />
          </div>
        </motion.div>
      </div>

      {feedback && (
        <FeedbackOverlay
          isVisible={showFeedback}
          isCorrect={feedback.isCorrect}
          message={feedback.message}
          encouragement={feedback.encouragement}
          onContinue={handleContinue}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
};

export default GamePage;