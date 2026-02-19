import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategoryCard from "@/components/game/CategoryCard";
import { Category, fetchCategories } from "@/lib/mockData";

const RevisionGames = () => {
  const navigate = useNavigate();
  
  // UPDATED: Split state into two separate arrays
  const [presetGames, setPresetGames] = useState<Category[]>([]);
  const [createdGames, setCreatedGames] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // 1. Load Defaults (Mochi's Library)
      const defaultData = await fetchCategories();
      setPresetGames(defaultData);

      // 2. Load User-Created Games from LocalStorage
      const savedGamesRaw = localStorage.getItem("created_games");
      const savedGames = savedGamesRaw ? JSON.parse(savedGamesRaw) : [];

      // 3. Map them to the Category format
      const mappedSavedGames = savedGames.map((game: any) => ({
        id: game.id,
        name: game.name,
        description: game.description || `${game.questions?.length || 0} question(s)`,
        icon_url: game.questions?.[0]?.options?.[0]?.image || "https://placehold.co/600x400?text=New+Game",
        color: "bg-white",
        isCustom: true,
        questionCount: game.questions?.length // ensure this is passed for the card
      }));

      setCreatedGames(mappedSavedGames);
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  const handlePlayCategory = (category: Category) => {
    navigate(`/game/${category.id}`);
  };

  const handleDeleteGame = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const savedGamesRaw = localStorage.getItem("created_games");
    if (savedGamesRaw) {
      const savedGames = JSON.parse(savedGamesRaw);
      const filtered = savedGames.filter((g: any) => g.id.toString() !== id.toString());
      localStorage.setItem("created_games", JSON.stringify(filtered));
      
      // UPDATED: Only update the createdGames state
      setCreatedGames(prev => prev.filter(c => c.id.toString() !== id.toString()));
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

      {/* SECTION 1: Created Games (Only shows if you have made one) */}
      {createdGames.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="mb-10"
        >
          <h2 className="text-xl font-bold mb-4 text-foreground/80 flex items-center gap-2">
            Created Games
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              {createdGames.length}
            </span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {createdGames.map((category, index) => (
              <div key={category.id} className="relative group">
                <CategoryCard
                  category={category}
                  onPlay={handlePlayCategory}
                  index={index}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-4 right-4 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  onClick={(e) => handleDeleteGame(category.id.toString(), e)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* SECTION 2: Preset Games (Mochi's Library) */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-foreground/80">Preset Games</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-card/50 rounded-3xl h-64 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {presetGames.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                onPlay={handlePlayCategory}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RevisionGames;