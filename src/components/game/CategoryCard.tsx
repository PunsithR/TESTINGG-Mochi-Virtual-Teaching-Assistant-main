import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Category } from "@/lib/mockData";

interface CategoryCardProps {
  category: Category;
  onPlay: (category: Category) => void;
  index: number;
}

const CategoryCard = ({ category, onPlay, index }: CategoryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
    >
      {/* Image */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={category.icon_url}
          alt={category.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-foreground mb-1">
          {category.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {category.description}
        </p>

        <Button
          onClick={() => onPlay(category)}
          className="w-full bg-login-button hover:/90 text-play-hover font-bold rounded-xl py-5"
        >
          Play
        </Button>
      </div>
    </motion.div>
  );
};

export default CategoryCard;
