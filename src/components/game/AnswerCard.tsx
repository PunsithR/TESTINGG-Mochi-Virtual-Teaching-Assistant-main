import { motion } from "framer-motion";
import { QuestionOption } from "@/lib/mockData";

interface AnswerCardProps {
  option: QuestionOption;
  onSelect: (option: QuestionOption) => void;
  isSelected?: boolean;
  isCorrect?: boolean;
  isRevealed?: boolean;
}

const AnswerCard = ({ 
  option, 
  onSelect, 
  isSelected = false,
  isCorrect,
  isRevealed = false,
}: AnswerCardProps) => {
  const getBorderColor = () => {
    if (!isRevealed) return isSelected ? "ring-4 ring-primary" : "";
    if (isCorrect) return "ring-4 ring-success";
    if (isSelected && !isCorrect) return "ring-4 ring-warning";
    return "";
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => onSelect(option)}
      className={`
        relative bg-card rounded-3xl overflow-hidden shadow-lg 
        transition-all duration-200 cursor-pointer
        min-h-[140px] min-w-[140px] p-3
        hover:shadow-xl
        ${getBorderColor()}
      `}
    >
      {/* Image Container */}
      <div className="w-full aspect-square rounded-2xl overflow-hidden bg-muted">
        <img
          src={option.image_url}
          alt={option.label}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Label */}
      <p className="mt-3 text-center text-lg font-bold text-foreground">
        {option.label}
      </p>

      {/* Correct/Incorrect indicator */}
      {isRevealed && isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-white ${
            isCorrect ? "bg-success" : "bg-warning"
          }`}
        >
          {isCorrect ? "✓" : "✗"}
        </motion.div>
      )}
    </motion.button>
  );
};

export default AnswerCard;
