import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, ArrowLeft, Trash2 } from "lucide-react"; // Added Trash2 for delete
import { Button } from "@/components/ui/button";
import CategoryCard from "@/components/game/CategoryCard";
import { Category, fetchCategories } from "@/lib/mockData";

const RevisionGames = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      // 1. Fetch the default preset categories
      const defaultData = await fetchCategories();
      
      // 2. Fetch locally saved games from localStorage
      const savedGamesRaw = localStorage.getItem("created_games");
      const savedGames = savedGamesRaw ? JSON.parse(savedGamesRaw) : [];

      // 3. Convert saved games into the Category format so they fit the UI
      const mappedSavedGames = savedGames.map((game: any) => ({
        id: game.id,
        name: game.name,
        description: game.description || `${game.questions?.length || 0} question(s)`,
        // Use a placeholder if no cover image exists
        icon_url: game.questions?.[0]?.options?.[0]?.image || "https://placehold.co/600x400?text=My+Game",
        color: "bg-white",
        isCustom: true // Track if it's a user-created game
      }));

      // Combine them: Newest created games appear at the top
      setCategories([...mappedSavedGames, ...defaultData]);
      setIsLoading(false);
    };
    
    loadCategories();
  }, []);

  const handlePlayCategory = (category: Category) => {
    navigate(`/game/${category.id}`);
  };

  // Optional: Function to delete a created game
  const handleDeleteGame = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the game when clicking delete
    const savedGamesRaw = localStorage.getItem("created_games");
    if (savedGamesRaw) {
      const savedGames = JSON.parse(savedGamesRaw);
      const filtered = savedGames.filter((g: any) => g.id !== id);
      localStorage.setItem("created_games", JSON.stringify(filtered));
      // Refresh the list
      setCategories(categories.filter(c => c.id.toString() !== id));
    }
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
          className="bg-primary hover:bg-primary/90 rounded-full w-12 h-12 p-0 shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </motion.header>

      {/* Created Games Section Label */}
      <h2 className="text-xl font-bold mb-4 text-foreground/80">Created Games</h2>

      {/* Category Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
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
            <div key={category.id} className="relative group">
              <CategoryCard
                category={category}
                onPlay={handlePlayCategory}
                index={index}
              />
              
              {/* Show red delete button only for custom games */}
              {(category as any).isCustom && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-4 right-4 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDeleteGame(category.id.toString(), e)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </motion.div>
      )}

      {/* Database Integration Comment for Teammate */}
      {/* NOTE FOR TEAMMATE: When the PostgreSQL tables are ready:
        1. Update loadCategories to fetch from GET /api/activities/recent.
        2. Replace the localStorage filter logic in handleDeleteGame with DELETE /api/activities/:id.
      */}
    </div>
  );
};

export default RevisionGames;