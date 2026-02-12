// Mock data structured to match PostgreSQL schema

export interface Category {
  id: number;
  name: string;
  description: string;
  icon_url: string;
  created_by?: number;
  color: string;
}

export interface Question {
  id: number;
  category_id: number;
  target_item: string;
  options: QuestionOption[];
  correct_answer: string;
  audio_url?: string;
}

export interface QuestionOption {
  id: number;
  label: string;
  image_url: string;
}

export interface Teacher {
  id: number;
  email: string;
  name: string;
}

export interface GameProgress {
  id: number;
  category_id: number;
  student_session: string;
  score: number;
  total_questions: number;
  completed_at?: string;
}

// Mock Categories
export const mockCategories: Category[] = [
  {
    id: 1,
    name: "Fruits",
    description: "Learn fruits using games",
    icon_url: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=300&fit=crop",
    color: "bg-red-100",
  },
  {
    id: 2,
    name: "Numbers",
    description: "Count and learn numbers",
    icon_url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop",
    color: "bg-blue-100",
  },
  {
    id: 3,
    name: "Shapes",
    description: "Identify different shapes",
    icon_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    color: "bg-purple-100",
  },
  {
    id: 4,
    name: "Animals",
    description: "Meet friendly animals",
    icon_url: "https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=400&h=300&fit=crop",
    color: "bg-green-100",
  },
  {
    id: 5,
    name: "Colours",
    description: "Explore rainbow colours",
    icon_url: "https://images.unsplash.com/photo-1502691876148-a84978e59af8?w=400&h=300&fit=crop",
    color: "bg-yellow-100",
  },
  {
    id: 6,
    name: "Vegetables",
    description: "Healthy veggies fun",
    icon_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop",
    color: "bg-orange-100",
  },
];

// Mock Questions for each category
export const mockQuestions: Record<number, Question[]> = {
  1: [ // Fruits
    {
      id: 1,
      category_id: 1,
      target_item: "Apple",
      options: [
        { id: 1, label: "Apple", image_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop" },
        { id: 2, label: "Banana", image_url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop" },
        { id: 3, label: "Grapes", image_url: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=300&h=300&fit=crop" },
      ],
      correct_answer: "Apple",
    },
    {
      id: 2,
      category_id: 1,
      target_item: "Banana",
      options: [
        { id: 1, label: "Orange", image_url: "https://images.unsplash.com/photo-1547514701-42782101795e?w=300&h=300&fit=crop" },
        { id: 2, label: "Banana", image_url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop" },
        { id: 3, label: "Strawberry", image_url: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=300&fit=crop" },
      ],
      correct_answer: "Banana",
    },
    {
      id: 3,
      category_id: 1,
      target_item: "Orange",
      options: [
        { id: 1, label: "Apple", image_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop" },
        { id: 2, label: "Orange", image_url: "https://images.unsplash.com/photo-1547514701-42782101795e?w=300&h=300&fit=crop" },
        { id: 3, label: "Grapes", image_url: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=300&h=300&fit=crop" },
      ],
      correct_answer: "Orange",
    },
  ],
  2: [ // Numbers
    {
      id: 4,
      category_id: 2,
      target_item: "Three",
      options: [
        { id: 1, label: "One", image_url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&h=300&fit=crop" },
        { id: 2, label: "Three", image_url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&h=300&fit=crop" },
        { id: 3, label: "Five", image_url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&h=300&fit=crop" },
      ],
      correct_answer: "Three",
    },
  ],
  3: [ // Shapes
    {
      id: 5,
      category_id: 3,
      target_item: "Circle",
      options: [
        { id: 1, label: "Circle", image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop" },
        { id: 2, label: "Square", image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop" },
        { id: 3, label: "Triangle", image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop" },
      ],
      correct_answer: "Circle",
    },
  ],
  4: [ // Animals
    {
      id: 6,
      category_id: 4,
      target_item: "Dog",
      options: [
        { id: 1, label: "Cat", image_url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop" },
        { id: 2, label: "Dog", image_url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop" },
        { id: 3, label: "Bird", image_url: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=300&h=300&fit=crop" },
      ],
      correct_answer: "Dog",
    },
  ],
  5: [ // Colours
    {
      id: 7,
      category_id: 5,
      target_item: "Red",
      options: [
        { id: 1, label: "Blue", image_url: "https://images.unsplash.com/photo-1502691876148-a84978e59af8?w=300&h=300&fit=crop" },
        { id: 2, label: "Red", image_url: "https://images.unsplash.com/photo-1502691876148-a84978e59af8?w=300&h=300&fit=crop" },
        { id: 3, label: "Green", image_url: "https://images.unsplash.com/photo-1502691876148-a84978e59af8?w=300&h=300&fit=crop" },
      ],
      correct_answer: "Red",
    },
  ],
  6: [ // Vegetables
    {
      id: 8,
      category_id: 6,
      target_item: "Carrot",
      options: [
        { id: 1, label: "Carrot", image_url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=300&fit=crop" },
        { id: 2, label: "Broccoli", image_url: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=300&h=300&fit=crop" },
        { id: 3, label: "Tomato", image_url: "https://images.unsplash.com/photo-1546470427-227c7369a9b9?w=300&h=300&fit=crop" },
      ],
      correct_answer: "Carrot",
    },
  ],
};

// Mock API Functions
export const fetchCategories = async (): Promise<Category[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockCategories;
};

export const fetchQuestions = async (categoryId: number): Promise<Question[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockQuestions[categoryId] || [];
};

// Mock Gemini AI Feedback Function
export interface GeminiFeedback {
  isCorrect: boolean;
  message: string;
  encouragement: string;
}

export const fetchGeminiFeedback = async (
  userAnswer: string,
  correctAnswer: string,
  targetItem: string
): Promise<GeminiFeedback> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
  
  if (isCorrect) {
    return {
      isCorrect: true,
      message: `Great job! That is a ${correctAnswer}! 🎉`,
      encouragement: "You're doing amazing!",
    };
  } else {
    return {
      isCorrect: false,
      message: `Close! That is a ${userAnswer}. Try finding the ${correctAnswer}!`,
      encouragement: "You can do it! Try again!",
    };
  }
};

// Mock Voice Recording Function (Prepared for Flask integration)
export const recordVoiceInput = async (): Promise<string> => {
  // This is a mock function - in production, this would:
  // 1. Use Web Speech API or a microphone library
  // 2. Send audio to Flask endpoint for processing
  // 3. Return transcribed text
  await new Promise(resolve => setTimeout(resolve, 2000));
  return "apple"; // Mock response
};
