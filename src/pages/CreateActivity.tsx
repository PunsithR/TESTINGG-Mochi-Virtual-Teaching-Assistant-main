import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Upload, 
  Save, 
  FileEdit, 
  Sparkles, 
  X, 
  Plus, 
  ChevronRight, 
  Loader2,
  CheckCircle,
  Circle
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
  correctOptionIndex: number;
}

const CreateActivity = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<TemplateMode>("select");
  
  // Dialog States
  const [showModeDialog, setShowModeDialog] = useState(true);
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // AI Input States
  const [gameTopic, setGameTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  
  // Game Data States
  const [questions, setQuestions] = useState<QuestionData[]>([
    {
      gameTitle: "",
      questionText: "",
      options: [
        { image: null, label: "" },
        { image: null, label: "" },
        { image: null, label: "" },
      ],
      correctOptionIndex: 0,
    },
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const imageInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null]);
  const currentQuestion = questions[currentQuestionIndex];

  // 1. Handle AI Generation Trigger
  const handleGenerate = async () => {
    if (!gameTopic || !subject || !description) {
      alert("Please fill in the Theme, Learning Goal, and Mochi's Instructions!");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameTopic, subject, description })
      });

      if (!response.ok) throw new Error("Failed to generate content");

      const data = await response.json();
      
      // Map Unsplash URLs from Python backend to the Frontend state
      const populatedQuestions: QuestionData[] = data.map((aiQ: any) => ({
        gameTitle: aiQ.gameTitle || gameTopic,
        questionText: aiQ.questionText || "Look at the picture!",
        options: aiQ.options.map((opt: any) => ({
          label: opt.label,
          image: opt.image || null // Real Unsplash URL from backend
        })),
        correctOptionIndex: 0 
      }));

      setQuestions(populatedQuestions);
      setCurrentQuestionIndex(0); 
      setIsGenerating(false);
      setShowAiDialog(false); 
      setMode("custom"); 

    } catch (error) {
      console.error("AI Generation Error:", error);
      setIsGenerating(false);
      alert("Mochi had trouble finding those photos. Please check your backend terminal!");
    }
  };

  // 2. Handle Final Save to LocalStorage
  const handleSave = () => {
    const title = questions[0].gameTitle || gameTopic || "Custom Game";
    
    const formattedQuestions = questions.map((q, index) => ({
      id: index + 1,
      questionText: q.questionText, 
      correctOptionIndex: q.correctOptionIndex,
      options: q.options.map((opt, oIdx) => ({
        id: oIdx + 1,
        label: opt.label,
        image_url: opt.image 
      }))
    }));

    const newCustomGame = {
      id: Date.now().toString(),
      name: title,
      description: description || "Interactive Revision Game",
      questionCount: formattedQuestions.length,
      questions: formattedQuestions,
      createdAt: new Date().toISOString()
    };

    const existingGames = JSON.parse(localStorage.getItem("created_games") || "[]");
    localStorage.setItem("created_games", JSON.stringify([newCustomGame, ...existingGames]));

    navigate("/revision-games"); 
  };

  // Helper Functions
  const handleModeSelect = (selectedMode: "ai" | "custom") => {
    if (selectedMode === "ai") {
      setShowModeDialog(false);
      setShowAiDialog(true);
    } else {
      setMode("custom");
      setShowModeDialog(false);
    }
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

  return (
    <div className="min-h-screen bg-background p-6">
      {/* HEADER (Only visible after mode selection) */}
      {mode === "custom" && (
        <>
          <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/revision-games")} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Customize Lesson</h1>
              <p className="text-muted-foreground text-sm">Review Mochi's picks and edit as you like!</p>
            </div>
          </motion.header>
          <div className="h-px bg-primary/20 mb-6" />
        </>
      )}

      {/* MODE SELECTION DIALOG */}
      <Dialog open={showModeDialog} onOpenChange={setShowModeDialog}>
         <DialogContent className="bg-card border-0 rounded-3xl p-8 max-w-md [&>button]:hidden">
           <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Create New Game</h2>
            <p className="text-muted-foreground mt-1">Choose how you want to build your lesson</p>
          </div>
           <div className="flex flex-col gap-4">
            <button onClick={() => handleModeSelect("custom")} className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-100 text-left">
              <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <FileEdit className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">Custom Template</h3>
                <p className="text-muted-foreground text-sm">Create everything from scratch</p>
              </div>
            </button>
            <button onClick={() => handleModeSelect("ai")} className="flex items-center gap-4 p-4 rounded-2xl bg-pink-50 hover:bg-pink-100 border border-pink-100 text-left">
              <div className="w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center shrink-0">
                <Sparkles className="w-7 h-7 text-pink-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">Mochi AI</h3>
                <p className="text-muted-foreground text-sm">Let Mochi find questions and photos for you</p>
              </div>
            </button>
          </div>
         </DialogContent>
      </Dialog>
      
      {/* MOCHI AI INPUT DIALOG */}
      <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
        <DialogContent className="bg-card border-0 rounded-3xl p-8 max-w-xl [&>button]:hidden">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-2xl font-bold text-foreground">Create with Mochi AI</h2>
            <button onClick={() => { setShowAiDialog(false); setShowModeDialog(true); }} className="opacity-70 hover:opacity-100">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-muted-foreground mb-6">Mochi will find the perfect photos for your students!</p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Game Theme (What do kids see?)</label>
              <Input 
                value={gameTopic} 
                onChange={(e) => setGameTopic(e.target.value)} 
                className="h-12 rounded-xl" 
                placeholder="e.g. Under the Sea, Dinosaurs, Jungle Animals"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Learning Goal (What's the skill?)</label>
              <Input 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                className="h-12 rounded-xl" 
                placeholder="e.g. Counting 1 to 5, Primary Colors, Letter Sounds"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Mochi's Instructions (Description)</label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="min-h-[100px] rounded-xl resize-none" 
                placeholder="e.g. Use very simple words. Make it whimsical and fun!"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => { setShowAiDialog(false); setShowModeDialog(true); }} className="flex-1 h-11 rounded-full border-gray-200">Back</Button>
              <Button onClick={handleGenerate} disabled={isGenerating} className="flex-1 h-11 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white gap-2">
                {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Mochi is searching...</> : <><Sparkles className="w-4 h-4" /> Generate & Edit</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* EDITOR UI (Visible after AI or Custom selection) */}
      <AnimatePresence mode="wait">
        {mode === "custom" && (
          <motion.div key="custom-mode" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="bg-card rounded-3xl shadow-soft overflow-hidden">
              {/* Question Navigation Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <Button variant="ghost" onClick={() => navigate("/revision-games")} className="text-muted-foreground hover:text-destructive font-semibold">
                  <X className="w-5 h-5 mr-2" /> Cancel
                </Button>
                
                <div className="flex flex-col items-center">
                  <span className="text-sm font-semibold text-foreground">Question {currentQuestionIndex + 1} of {questions.length}</span>
                  <div className="flex gap-2 mt-1">
                    {questions.map((_, i) => (
                      <button key={i} onClick={() => setCurrentQuestionIndex(i)} className={`w-3 h-3 rounded-full ${i === currentQuestionIndex ? "bg-primary" : "bg-muted"}`} />
                    ))}
                  </div>
                </div>

                <Button onClick={() => currentQuestionIndex < questions.length - 1 && setCurrentQuestionIndex(currentQuestionIndex + 1)} disabled={currentQuestionIndex >= questions.length - 1} className="bg-primary hover:bg-primary/90 font-semibold rounded-full px-6">
                  Next <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>

              {/* Editable Fields */}
              <div className="p-8 max-w-3xl mx-auto">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Game Title</label>
                  <Input value={currentQuestion.gameTitle} onChange={(e) => updateCurrentQuestion({ gameTitle: e.target.value })} className="rounded-xl h-12" />
                </div>
                <div className="mb-8">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Question Text</label>
                  <Textarea value={currentQuestion.questionText} onChange={(e) => updateCurrentQuestion({ questionText: e.target.value })} className="rounded-xl min-h-[60px]" />
                </div>

                {/* Question Cards (Options) */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  {currentQuestion.options.map((option, index) => {
                    const isCorrect = currentQuestion.correctOptionIndex === index;
                    return (
                      <div key={index} className="flex flex-col items-center gap-3">
                        <div 
                          onClick={() => imageInputRefs.current[index]?.click()} 
                          className={`w-full aspect-[4/5] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden relative transition-all 
                            ${isCorrect ? "border-green-500 bg-green-50/50" : "border-border hover:border-primary/50 bg-muted/10"}`}
                        >
                          {option.image ? (
                            <img src={option.image} alt={option.label} className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground text-center px-2">Click to Upload</p>
                            </>
                          )}
                        </div>
                        <input ref={(el) => { imageInputRefs.current[index] = el; }} type="file" accept="image/*" onChange={(e) => handleImageUpload(index, e)} className="hidden" />
                        
                        <Input 
                          value={option.label} 
                          onChange={(e) => {
                            const newOptions = [...currentQuestion.options];
                            newOptions[index].label = e.target.value;
                            updateCurrentQuestion({ options: newOptions });
                          }} 
                          placeholder={`Option ${index + 1}`} 
                          className="text-center border-0 bg-transparent font-semibold focus-visible:ring-0" 
                        />

                        <button onClick={() => updateCurrentQuestion({ correctOptionIndex: index })} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium ${isCorrect ? "bg-green-100 text-green-700 ring-1 ring-green-200" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                          {isCorrect ? <><CheckCircle className="w-4 h-4 fill-green-500 text-white" /> Correct</> : <><Circle className="w-4 h-4" /> Mark Correct</>}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Controls */}
                <div className="flex justify-center gap-4">
                  <Button onClick={() => setQuestions(prev => [...prev, { gameTitle: currentQuestion.gameTitle, questionText: "", options: [{ image: null, label: "" }, { image: null, label: "" }, { image: null, label: "" }], correctOptionIndex: 0 }])} className="rounded-full px-8 py-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 gap-2">
                    <Plus className="w-5 h-5" /> Add Question
                  </Button>
                  <Button onClick={handleSave} className="rounded-full px-8 py-3 bg-green-500 hover:bg-green-600 text-white gap-2 shadow-lg hover:shadow-xl transition-all">
                    <Save className="w-5 h-5" /> Save Lesson
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