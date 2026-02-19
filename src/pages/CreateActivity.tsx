import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
// UPDATED IMPORTS: Added Loader2, kept Eye and FileText to match your original file
import { 
  ArrowLeft, 
  Upload, 
  Save, 
  Eye, 
  FileText, 
  FileEdit, 
  Sparkles, 
  X, 
  Plus, 
  ChevronRight, 
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

type TemplateMode = "select" | "ai" | "custom";

interface ImageOption {
  image: string | null;
  label: string;
}

interface QuestionData {
  gameTitle: string;
  questionText: string;
  options: ImageOption[];
}

const CreateActivity = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<TemplateMode>("select");
  
  // Dialog States
  const [showModeDialog, setShowModeDialog] = useState(true);
  const [showAiDialog, setShowAiDialog] = useState(false);
  
  // Loading State
  const [isGenerating, setIsGenerating] = useState(false);

  // AI Inputs
  const [gameTopic, setGameTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  
  // Editor State
  const [questions, setQuestions] = useState<QuestionData[]>([
    {
      gameTitle: "",
      questionText: "",
      options: [
        { image: null, label: "" },
        { image: null, label: "" },
        { image: null, label: "" },
      ],
    },
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const imageInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null]);
  const currentQuestion = questions[currentQuestionIndex];

  // --- HANDLERS ---

  const handleModeSelect = (selectedMode: "ai" | "custom") => {
    if (selectedMode === "ai") {
      setShowModeDialog(false);
      setShowAiDialog(true);
    } else {
      setMode("custom");
      setShowModeDialog(false);
    }
  };

  const handleGenerate = async () => {
    if (!gameTopic || !subject || !description) {
      alert("Please fill in Game Topic, Subject, and Description!");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameTopic, subject, description })
      });

      if (!response.ok) throw new Error("Failed to generate");

      const data = await response.json();
      
      // 1. Map API data to the Editor's QuestionData format
      // We assume the API returns objects with { question: string, options: string[] }
      const populatedQuestions: QuestionData[] = data.map((aiQ: any) => ({
        gameTitle: gameTopic,
        questionText: aiQ.question || aiQ.questionText || "AI Question",
        options: aiQ.options.map((optLabel: string) => ({
          label: optLabel,
          // UPDATED: Auto-generate a placeholder image with the text inside
          image: `https://placehold.co/600x400/orange/white?text=${encodeURIComponent(optLabel)}`
        }))
      }));

      // 2. Load the data into the editor state
      setQuestions(populatedQuestions);
      setCurrentQuestionIndex(0); // Reset to first question

      // 3. Switch to Custom Mode to show the filled editor
      setIsGenerating(false);
      setShowAiDialog(false); 
      setMode("custom"); 

    } catch (error) {
      console.error("Error:", error);
      setIsGenerating(false);
      alert("Mochi is currently offline. Please try again later.");
    }
  };

  const handleSave = () => {
    // This title logic ensures we use the first question's title if available
    const title = questions[0].gameTitle || gameTopic || "Custom Game";
    
    // --- SAVE TO LOCAL STORAGE ---
    const newCustomGame = {
      id: Date.now().toString(),
      name: title,
      description: description || "Manually created lesson",
      questionCount: questions.length,
      questions: questions,
      isAiGenerated: false,
      createdAt: new Date().toISOString()
    };

    const existingGames = JSON.parse(localStorage.getItem("created_games") || "[]");
    localStorage.setItem("created_games", JSON.stringify([newCustomGame, ...existingGames]));

    // Direct redirect to Gallery (No Alert)
    navigate("/revision-games"); 
  };

  const updateCurrentQuestion = (updates: Partial<QuestionData>) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[currentQuestionIndex] = { ...updated[currentQuestionIndex], ...updates };
      return updated;
    });
  };

  const handleImageUpload = (optionIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newOptions = [...currentQuestion.options];
        newOptions[optionIndex] = { ...newOptions[optionIndex], image: reader.result as string };
        updateCurrentQuestion({ options: newOptions });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLabelChange = (optionIndex: number, label: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[optionIndex] = { ...newOptions[optionIndex], label };
    updateCurrentQuestion({ options: newOptions });
  };

  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        gameTitle: currentQuestion.gameTitle,
        questionText: "",
        options: [{ image: null, label: "" }, { image: null, label: "" }, { image: null, label: "" }],
      },
    ]);
    setCurrentQuestionIndex(questions.length);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* 1. Custom Editor Header */}
      {mode === "custom" && (
        <>
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <Button variant="ghost" size="icon" onClick={() => navigate("/revision-games")} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Customize Template</h1>
              <p className="text-muted-foreground text-sm">Review and edit your Mochi lesson</p>
            </div>
          </motion.header>
          <div className="h-px bg-primary/20 mb-6" />
        </>
      )}

      {/* 2. Initial Selection Dialog */}
      <Dialog open={showModeDialog} onOpenChange={setShowModeDialog}>
        <DialogContent className="bg-card border-0 rounded-3xl p-8 max-w-md [&>button]:hidden">
          <button onClick={() => navigate("/revision-games")} className="absolute right-4 top-4 opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Create New Game</h2>
            <p className="text-muted-foreground mt-1">Choose how you want to create your revision game</p>
          </div>
          <div className="flex flex-col gap-4">
            <button onClick={() => handleModeSelect("custom")} className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-100 text-left">
              <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <FileEdit className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">Custom Template</h3>
                <p className="text-muted-foreground text-sm">Create your own questions from scratch</p>
              </div>
            </button>
            <button onClick={() => handleModeSelect("ai")} className="flex items-center gap-4 p-4 rounded-2xl bg-pink-50 hover:bg-pink-100 border border-pink-100 text-left">
              <div className="w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center shrink-0">
                <Sparkles className="w-7 h-7 text-pink-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">AI-Generated</h3>
                <p className="text-muted-foreground text-sm">Let Mochi create questions automatically</p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 3. AI Input Dialog */}
      <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
        <DialogContent className="bg-card border-0 rounded-3xl p-8 max-w-xl [&>button]:hidden">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-2xl font-bold text-foreground">Create New Game</h2>
            <button 
              onClick={() => navigate("/revision-games")} 
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-muted-foreground mb-6">Choose how you want to create your game</p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Game Topic <span className="text-red-500">*</span>
              </label>
              <Input 
                value={gameTopic}
                onChange={(e) => setGameTopic(e.target.value)}
                placeholder="e.g. Fruits, Animals, Solar System" 
                className="h-12 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Subject</label>
              <Input 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Science, Math, English" 
                className="h-12 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <Textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the game you want to create..." 
                className="min-h-[100px] rounded-xl resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => { setShowAiDialog(false); setShowModeDialog(true); }}
                className="flex-1 h-11 rounded-full border-gray-200"
              >
                Back
              </Button>
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 h-11 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
              >
                {isGenerating ? (
                   <>
                     <Loader2 className="w-4 h-4 animate-spin" />
                     Generating...
                   </>
                ) : (
                   <>
                     <Sparkles className="w-4 h-4" />
                     Generate & Edit
                   </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 4. Main Editor Interface */}
      <AnimatePresence mode="wait">
        {mode === "custom" && (
          <motion.div
            key="custom-mode"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-card rounded-3xl shadow-soft overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <Button variant="ghost" onClick={() => navigate("/revision-games")} className="text-muted-foreground hover:text-destructive font-semibold">
                  <X className="w-5 h-5 mr-2" /> Cancel
                </Button>
                
                <div className="flex flex-col items-center">
                  <span className="text-sm font-semibold text-foreground">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <div className="flex gap-2 mt-1">
                    {questions.map((_, i) => (
                      <button 
                        key={i} 
                        onClick={() => setCurrentQuestionIndex(i)} 
                        className={`w-3 h-3 rounded-full transition-colors ${i === currentQuestionIndex ? "bg-primary" : "bg-muted"}`} 
                      />
                    ))}
                  </div>
                </div>

                <Button onClick={handleNextQuestion} disabled={currentQuestionIndex >= questions.length - 1} className="bg-primary hover:bg-primary/90 font-semibold rounded-full px-6">
                  Next <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>

              <div className="p-8 max-w-3xl mx-auto">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Game Title</label>
                  <Input 
                    value={currentQuestion.gameTitle} 
                    onChange={(e) => updateCurrentQuestion({ gameTitle: e.target.value })} 
                    className="rounded-xl h-12" 
                    placeholder="e.g. Fruit Quiz" 
                  />
                </div>
                <div className="mb-8">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Question Text</label>
                  <Textarea 
                    value={currentQuestion.questionText} 
                    onChange={(e) => updateCurrentQuestion({ questionText: e.target.value })} 
                    className="rounded-xl min-h-[60px]" 
                    placeholder="e.g. Can you show me the Apple?" 
                  />
                </div>

                <div className="grid grid-cols-3 gap-6 mb-8">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        onClick={() => imageInputRefs.current[index]?.click()} 
                        className="w-full aspect-[4/5] border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 overflow-hidden relative bg-muted/10 transition-colors"
                      >
                        {option.image ? (
                          <img src={option.image} alt={option.label} className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Upload Image</p>
                          </>
                        )}
                      </div>
                      <input 
                        ref={(el) => { imageInputRefs.current[index] = el; }} 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(index, e)} 
                        className="hidden" 
                      />
                      <Input 
                        value={option.label} 
                        onChange={(e) => handleLabelChange(index, e.target.value)} 
                        placeholder={`Option ${index + 1}`} 
                        className="mt-3 text-center border-0 bg-transparent font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50" 
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-center gap-4">
                  <Button onClick={handleAddQuestion} className="rounded-full px-8 py-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 gap-2">
                    <Plus className="w-5 h-5" /> Add Question
                  </Button>
                  <Button onClick={handleSave} className="rounded-full px-8 py-3 bg-green-500 hover:bg-green-600 text-white gap-2 shadow-lg hover:shadow-xl transition-all">
                    <Save className="w-5 h-5" /> Save Game
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateActivity;