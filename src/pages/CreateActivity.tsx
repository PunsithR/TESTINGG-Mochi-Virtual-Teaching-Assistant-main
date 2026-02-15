import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Upload, Camera, Volume2, RotateCcw, ArrowRight, Save, Eye, FileText, FileEdit, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import MochiAvatar from "@/components/game/MochiAvatar";

type TemplateMode = "select" | "ai" | "custom";

interface RecentActivity {
  id: string;
  name: string;
  className: string;
  status: "completed" | "pending";
}

const CreateActivity = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<TemplateMode>("select");
  const [showModeDialog, setShowModeDialog] = useState(true);
  
  // AI Template state
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Custom Template state
  const [lessonName, setLessonName] = useState("Lesson name");
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(3);
  const [answerText, setAnswerText] = useState("");
  const [answerImage, setAnswerImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const recentActivities: RecentActivity[] = [
    { id: "1", name: "Fruits", className: "Class A", status: "completed" },
    { id: "2", name: "Numbers", className: "Class A", status: "pending" },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnswerImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModeSelect = (selectedMode: "ai" | "custom") => {
    setMode(selectedMode);
    setShowModeDialog(false);
  };

  // --- CHANGED: AJAX CALL FOR GEMINI API ---
  const handleGenerate = async () => {
    if (!subject || !description) {
      alert("Please fill in the Subject and Description for Mochi!");
      return;
    }

    console.log("Generating with AI:", { subject, description, uploadedFile });
    
    // This is where you send the text to Gemini
    // try {
    //   const response = await fetch('YOUR_BACKEND_URL/generate', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ subject, description })
    //   });
    //   const data = await response.json();
    //   console.log("Gemini Response:", data);
    // } catch (e) { console.error(e); }

    alert(`Mochi is creating a ${subject} lesson based on your description!`);
  };

  // --- CHANGED: POINT FOR PSYCHOPG2 INTEGRATION ---
  const handleSave = () => {
    console.log("Saving activity data to PostgreSQL...");
    // DB INTEGRATION: Your teammate will use psycopg2 here in the backend
    // to save the 'subject' and 'description' variables.
    
    alert("Activity Saved!");
    navigate("/revision-games");
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setAnswerText("");
      setAnswerImage(null);
    }
  };

  const handleRepeat = () => {
    setAnswerText("");
    setAnswerImage(null);
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

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
              className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 transition-colors text-left border border-amber-100"
            >
              <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <FileEdit className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">Custom Template</h3>
                <p className="text-muted-foreground text-sm">Create your own questions and upload images</p>
              </div>
            </button>
            
            <button
              onClick={() => handleModeSelect("ai")}
              className="flex items-center gap-4 p-4 rounded-2xl bg-pink-50 hover:bg-pink-100 transition-colors text-left border border-pink-100"
            >
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

      <AnimatePresence mode="wait">
        {mode === "ai" && (
          <motion.div
            key="ai-mode"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-card rounded-3xl p-8 shadow-soft">
              {/* --- CHANGED: SUBJECT INPUT --- */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Subject
                </label>
                <Input
                  placeholder="Enter a subject (e.g., Fruits, Cars, Space)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="rounded-xl border-border h-12"
                />
              </div>

              {/* --- CHANGED: DESCRIPTION INPUT --- */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description how the template looks like"
                  className="rounded-xl border-border min-h-[80px]"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Previous or Required Template
                </label>
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.ppt,.pptx,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div className="flex justify-center mb-6">
                <Button
                  onClick={handleGenerate}
                  variant="default"
                  className="rounded-full px-12 bg-pink-500 hover:bg-pink-600 text-white h-12 gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate with Mochi
                </Button>
              </div>

              <div className="flex justify-between border-t pt-6">
                <Button
                  onClick={handleSave}
                  variant="outline"
                  className="rounded-full gap-2 px-6"
                >
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

        {mode === "custom" && (
          <motion.div
            key="custom-mode"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-muted/30 rounded-3xl p-6 shadow-soft overflow-hidden">
              <div className="flex items-center justify-between mb-4 bg-muted/50 rounded-2xl p-4">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">m</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Learning:</span>
                  <Input
                    value={lessonName}
                    onChange={(e) => setLessonName(e.target.value)}
                    className="border-0 bg-transparent text-primary font-bold p-0 h-auto text-sm w-32"
                    placeholder="Lesson name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-muted/40 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[280px]">
                  <MochiAvatar size="xl" showBubble={false} />
                  <div className="mt-4 bg-card rounded-xl px-6 py-3 shadow-soft w-full max-w-[200px]">
                    <Input
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder="Enter Text"
                      className="border-0 bg-transparent text-center text-foreground font-semibold placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>

                <div className="bg-muted/40 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[280px]">
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="flex-1 w-full bg-card rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-card/80 transition-all border-2 border-dashed border-transparent hover:border-primary/30"
                  >
                    {answerImage ? (
                      <img src={answerImage} alt="Answer" className="max-h-32 object-contain rounded-lg" />
                    ) : (
                      <>
                        <Camera className="w-12 h-12 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload image</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="mt-4 text-center">
                    <Button variant="outline" className="rounded-full gap-2">
                      <Volume2 className="w-4 h-4" /> Listen
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <Button onClick={handleRepeat} variant="outline" className="rounded-full gap-2"><RotateCcw className="w-4 h-4" /> Repeat</Button>
                <Button onClick={handleNext} className="rounded-full gap-2 bg-primary"><ArrowRight className="w-4 h-4" /> Next</Button>
              </div>

              <div className="mt-6 bg-muted/50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Lesson Progress</span>
                  <span className="text-sm">{currentStep} of {totalSteps}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleSave} className="rounded-full px-12 py-6 text-lg bg-primary hover:bg-primary/90">Save Template</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateActivity;