import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Upload, Save, Eye, FileText, FileEdit, Sparkles, X, Plus, ChevronRight } from "lucide-react";
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
  const [showModeDialog, setShowModeDialog] = useState(true);

  // AI Template state
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Template state - multi-question support
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

  const handleModeSelect = (selectedMode: "ai" | "custom") => {
    setMode(selectedMode);
    setShowModeDialog(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  const handleGenerate = async () => {
    if (!subject || !description) {
      alert("Please fill in the Subject and Description for Mochi!");
      return;
    }
    alert(`Mochi is creating a ${subject} lesson based on your description!`);
  };

  // Custom template handlers
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
        gameTitle: currentQuestion.gameTitle, // carry forward the game title
        questionText: "",
        options: [
          { image: null, label: "" },
          { image: null, label: "" },
          { image: null, label: "" },
        ],
      },
    ]);
    setCurrentQuestionIndex(questions.length);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSave = () => {
    console.log("Saving game data:", questions);
    alert("Game Saved!");
    navigate("/revision-games");
  };

  const recentActivities = [
    { id: "1", name: "Fruits", className: "Class A", status: "completed" as const },
    { id: "2", name: "Numbers", className: "Class A", status: "pending" as const },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/revision-games")}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {mode === "ai" ? "Create Activity" : "Customize Template"}
          </h1>
          <p className="text-muted-foreground text-sm">
            Create and manage your lessons using Mochi AI
          </p>
        </div>
      </motion.header>

      <div className="h-px bg-primary/20 mb-6" />

      {/* Mode Selection Dialog */}
      <Dialog open={showModeDialog} onOpenChange={setShowModeDialog}>
        <DialogContent className="bg-card border-0 rounded-3xl p-8 max-w-md">
          <button
            onClick={() => setShowModeDialog(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Create New Game</h2>
            <p className="text-muted-foreground mt-1">Choose how you want to create your revision game</p>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleModeSelect("custom")}
              className="flex items-center gap-4 p-4 rounded-2xl bg-accent hover:bg-accent/80 transition-colors text-left border border-accent"
            >
              <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center shrink-0">
                <FileEdit className="w-7 h-7 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">Custom Template</h3>
                <p className="text-muted-foreground text-sm">Create your own questions and upload images</p>
              </div>
            </button>

            <button
              onClick={() => handleModeSelect("ai")}
              className="flex items-center gap-4 p-4 rounded-2xl bg-secondary hover:bg-secondary/80 transition-colors text-left border border-secondary"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">AI-Generated</h3>
                <p className="text-muted-foreground text-sm">Let Mochi create questions automatically</p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <AnimatePresence mode="wait">
        {/* AI Mode */}
        {mode === "ai" && (
          <motion.div
            key="ai-mode"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-card rounded-3xl p-8 shadow-soft">
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                <Input
                  placeholder="Enter a subject (e.g., Fruits, Cars, Space)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="rounded-xl border-border h-12"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description how the template looks like"
                  className="rounded-xl border-border min-h-[80px]"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Previous or Required Template</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground/70">PDF, PPT, or Images</p>
                  {uploadedFile && <p className="mt-2 text-primary font-medium">{uploadedFile.name}</p>}
                  <Button variant="outline" className="mt-4 rounded-full">Browse Files</Button>
                </div>
                <input ref={fileInputRef} type="file" accept=".pdf,.ppt,.pptx,image/*" onChange={handleFileUpload} className="hidden" />
              </div>

              <div className="flex justify-center mb-6">
                <Button onClick={handleGenerate} className="rounded-full px-12 bg-primary hover:bg-primary/90 text-primary-foreground h-12 gap-2">
                  <Sparkles className="w-4 h-4" />
                  Generate with Mochi
                </Button>
              </div>

              <div className="flex justify-between border-t pt-6">
                <Button onClick={handleSave} variant="outline" className="rounded-full gap-2 px-6">
                  <Save className="w-4 h-4" />
                  Save Template
                </Button>
                <Button variant="outline" className="rounded-full gap-2 px-6">
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-3xl p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activities</h3>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-background rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{activity.name}</p>
                        <p className="text-sm text-muted-foreground">{activity.className}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${activity.status === "completed" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                      {activity.status === "completed" ? "Completed" : "To Be Completed"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Custom Mode - Redesigned to match screenshot */}
        {mode === "custom" && (
          <motion.div
            key="custom-mode"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-card rounded-3xl shadow-soft overflow-hidden">
              {/* Top Navigation Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/revision-games")}
                  className="text-muted-foreground hover:text-destructive font-semibold"
                >
                  <X className="w-5 h-5 mr-2" />
                  End
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
                        className={`w-3 h-3 rounded-full transition-colors ${
                          i === currentQuestionIndex
                            ? "bg-primary"
                            : i < currentQuestionIndex
                            ? "bg-success"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex >= questions.length - 1}
                  className="bg-primary hover:bg-primary/90 font-semibold rounded-full px-6"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>

              {/* Form Content */}
              <div className="p-8 max-w-3xl mx-auto">
                {/* Game Title */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Game Title
                  </label>
                  <Input
                    value={currentQuestion.gameTitle}
                    onChange={(e) => updateCurrentQuestion({ gameTitle: e.target.value })}
                    placeholder="e.g. Fruit Quiz"
                    className="rounded-xl border-border h-12 bg-background"
                  />
                </div>

                {/* Question Text */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Enter your question
                  </label>
                  <Textarea
                    value={currentQuestion.questionText}
                    onChange={(e) => updateCurrentQuestion({ questionText: e.target.value })}
                    placeholder="e.g. Can you show me the Apple?"
                    className="rounded-xl border-border min-h-[60px] bg-background"
                  />
                </div>

                {/* Three Image Upload Cards */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex flex-col items-center">
                      {/* Upload Card */}
                      <div
                        onClick={() => imageInputRefs.current[index]?.click()}
                        className="w-full aspect-[4/5] border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-background overflow-hidden"
                      >
                        {option.image ? (
                          <img
                            src={option.image}
                            alt={option.label || `Option ${index + 1}`}
                            className="w-full h-full object-cover rounded-2xl"
                          />
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

                      {/* Label Input */}
                      <Input
                        value={option.label}
                        onChange={(e) => handleLabelChange(index, e.target.value)}
                        placeholder="Label"
                        className="mt-3 text-center border-0 bg-transparent text-foreground font-semibold placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={handleAddQuestion}
                    className="rounded-full px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Question
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="rounded-full px-8 py-3 bg-success hover:bg-success/90 text-success-foreground font-semibold gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Game
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
