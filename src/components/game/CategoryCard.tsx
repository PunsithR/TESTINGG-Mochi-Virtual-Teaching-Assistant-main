import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Category } from "@/lib/mockData";
import { Play } from "lucide-react"; // Added Play icon to match your screenshot

interface CategoryCardProps {
  category: Category;
  onPlay: (category: Category) => void;
  index: number;
}

const CategoryCard = ({ category, onPlay, index }: CategoryCardProps) => {
  // Check if this is a custom game to get the question count
  const qCount = (category as any).questionCount || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
    >
      {/* Image Section */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={category.icon_url}
          alt={category.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-foreground">
          {category.name}
        </h3>
        
        {/* UPDATED: Added Question Count to match screenshot */}
        <div className="flex flex-col mb-4">
          <p className="text-sm text-muted-foreground">
            {qCount > 0 ? `${qCount} question(s)` : category.description}
          </p>
          {/* Duplicating text as seen in your screenshot if it's a custom game */}
          {qCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {qCount} question(s)
            </p>
          )}
        </div>

        {/* UPDATED: Play Button with Icon to match screenshot */}
        <Button
          onClick={() => onPlay(category)}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl py-6 flex gap-2 items-center justify-center transition-colors"
        >
          <Play className="w-5 h-5 fill-current" />
          Play
        </Button>
      </div>
    </motion.div>
  );
};

export default CategoryCard;