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
  name: string; 
  description: string;
  questions: {
    questionText: string; 
    options: { label: string; image: string | null }[];
  }[];
  createdAt: string;
}

const convertSavedGameQuestions = (savedGame: any): Question[] => {
  return savedGame.questions.map((q: any, idx: number) => {
    
    const correctAnswer = q.correct_answer || (q.options[q.correctOptionIndex || 0]?.label) || "Unknown";
    
    return {
      id: idx + 1,
      category_id: -1,
      target_item: q.target_item || correctAnswer,
      correct_answer: correctAnswer,
      correct_answer_id: q.correct_answer_id, // Grab the explicit ID mapping
      options: q.options.map((opt: any, optIdx: number) => ({
        id: optIdx + 1,
        label: opt.label,
        image_url: opt.image_url || opt.image || `https://placehold.co/300x300?text=${opt.label}`,
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

      const savedGamesRaw = localStorage.getItem("created_games");
      const savedGames = savedGamesRaw ? JSON.parse(savedGamesRaw) : [];
      
      const localGame = savedGames.find((g: any) => g.id.toString() === categoryId);

      if (localGame) {
        const convertedQuestions = convertSavedGameQuestions(localGame);
        setQuestions(convertedQuestions);
        setIsLoading(false);
      } else {
        try {
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
    
    // 1. Check if the clicked ID matches the correct ID
    const isCorrectLocally = (currentQuestion as any).correct_answer_id 
      ? option.id === (currentQuestion as any).correct_answer_id
      : option.label.toLowerCase() === currentQuestion.correct_answer.toLowerCase();
    
    // 2. Fetch the AI feedback
    const result = await fetchGeminiFeedback(
      option.label,
      currentQuestion.correct_answer,
      currentQuestion.target_item
    );
    
    // 3. THE TEXT FIX: Override the text to match the visual card!
    result.isCorrect = isCorrectLocally;
    
    const targetName = currentQuestion.target_item && currentQuestion.target_item !== "Unknown" 
      ? currentQuestion.target_item 
      : "correct answer";

    if (isCorrectLocally) {
      // Force success message
      result.message = `Great job! You found the ${targetName}!`;
      result.encouragement = "Keep it up!";
    } else {
      // Force try again message
      result.message = `Close! Try finding the ${targetName}!`;
      result.encouragement = "You can do it! Try again!";
    }
    
    setFeedback(result);
    
    if (isCorrectLocally) {
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
      // Failsafe for voice: if it doesn't match an option, it's incorrect
      result.isCorrect = false;
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
            {currentQuestion.options.map((option) => {
              const isOptionCorrectLocally = (currentQuestion as any).correct_answer_id
                ? option.id === (currentQuestion as any).correct_answer_id
                : option.label === currentQuestion.correct_answer;

              return (
                <AnswerCard
                  key={option.id}
                  option={option}
                  onSelect={handleSelectOption}
                  isSelected={selectedOption?.id === option.id}
                  isCorrect={isOptionCorrectLocally}
                  isRevealed={showFeedback}
                />
              );
            })}
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