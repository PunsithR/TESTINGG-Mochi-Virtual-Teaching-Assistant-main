import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import mochiMascot from '@/assets/mochi-mascot.jpeg';
import teacherAvatar from '@/assets/teacher-avatar.png';

// TODO: Database Integration
// When connecting to PostgreSQL database:
// 1. Create forgot-password API endpoint
// 2. Generate password reset token
// 3. Send email with reset link
// 4. Implement reset password page

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    // TODO: Replace with actual API call
    // try {
    //   const response = await fetch('/api/auth/forgot-password', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email })
    //   });
    //   const data = await response.json();
    //   if (data.success) {
    //     setIsSubmitted(true);
    //   } else {
    //     setError(data.message);
    //   }
    // } catch (err) {
    //   setError('Connection error. Please try again.');
    // }

    // Mock for demo
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Mochi mascot */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <div className="text-center">
          <img 
            src={mochiMascot} 
            alt="Mochi - Virtual Teaching Assistant" 
            className="w-80 h-80 object-contain mx-auto animate-float drop-shadow-2xl"
          />
          <h1 className="mt-8 text-4xl font-bold text-foreground tracking-wide">
            Mochi
          </h1>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="login-card w-full max-w-md">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <img 
              src={teacherAvatar} 
              alt="Teacher Avatar" 
              className="w-20 h-20 rounded-full object-cover shadow-md"
            />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">Reset Password</h2>
            <p className="text-muted-foreground mt-1">
              {isSubmitted 
                ? "Check your email for reset instructions"
                : "Enter your email to receive reset instructions"}
            </p>
          </div>

          {isSubmitted ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground mb-6">
                If an account exists with <strong>{email}</strong>, you'll receive an email with password reset instructions.
              </p>
              <Link to="/login" className="login-button inline-flex">
                <ArrowLeft size={20} />
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              {/* Error message */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teacher@school.edu"
                    className="login-input"
                    disabled={isLoading}
                  />
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    type="submit"
                    className="login-button"
                    disabled={isLoading}
                  >
                    <Mail size={20} />
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>

              {/* Back to login */}
              <p className="text-center mt-6">
                <Link to="/login" className="login-link inline-flex items-center gap-2">
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
