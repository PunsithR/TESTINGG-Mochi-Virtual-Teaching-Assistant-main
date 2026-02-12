import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategoryCard from "@/components/game/CategoryCard";
import { Category, fetchCategories } from "@/lib/mockData";

const RevisionGames = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchCategories();
      setCategories(data);
      setIsLoading(false);
    };
    loadCategories();
  }, []);

  const handlePlayCategory = (category: Category) => {
    navigate(`/game/${category.id}`);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Revision Games</h1>
            <p className="text-muted-foreground text-sm">
              Create and manage your lessons using Mochi AI
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate("/create-activity")}
          className="bg-primary hover:bg-primary/90 rounded-full w-12 h-12 p-0"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </motion.header>

      {/* Category Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-card/50 rounded-3xl h-64 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 gap-6"
        >
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              onPlay={handlePlayCategory}
              index={index}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default RevisionGames;
