import { Link } from 'react-router-dom';
import { LogIn, Sparkles } from 'lucide-react';
import mochiMascot from '@/assets/mochi-mascot.jpeg';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Hero Section */}
      <div className="text-center max-w-2xl">
        {/* Mascot */}
        <img 
          src={mochiMascot} 
          alt="Mochi - Virtual Teaching Assistant" 
          className="w-48 h-48 md:w-64 md:h-64 object-contain mx-auto animate-float drop-shadow-2xl mb-8"
        />
        
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Welcome to <span className="text-primary">Mochi</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          Your Virtual Teaching Assistant for Early Childhood Education. 
          Empowering teachers with AI-powered lesson planning and student support.
        </p>

        {/* Feature highlights */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <span className="inline-flex items-center gap-1 px-4 py-2 bg-secondary rounded-full text-sm text-foreground">
            <Sparkles size={16} className="text-primary" />
            AI-Powered
          </span>
          <span className="inline-flex items-center gap-1 px-4 py-2 bg-secondary rounded-full text-sm text-foreground">
            <Sparkles size={16} className="text-primary" />
            Lesson Planning
          </span>
          <span className="inline-flex items-center gap-1 px-4 py-2 bg-secondary rounded-full text-sm text-foreground">
            <Sparkles size={16} className="text-primary" />
            Student Tracking
          </span>
        </div>

        {/* CTA Button - Login only */}
        <div className="flex justify-center">
          <Link to="/login" className="login-button text-lg">
            <LogIn size={22} />
            Teacher Login
          </Link>
        </div>
      </div>

      {/* Footer note */}
      <p className="absolute bottom-6 text-sm text-muted-foreground">
        Virtual Teaching Assistant for Early Childhood Education Centres
      </p>
    </div>
  );
};

export default Index;
