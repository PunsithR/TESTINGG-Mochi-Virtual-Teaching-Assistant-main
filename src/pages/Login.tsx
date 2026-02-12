import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import mochiMascot from '@/assets/mochi-mascot.jpeg';
import teacherAvatar from '@/assets/teacher-avatar.png';

// TODO: Database Integration
// When connecting to PostgreSQL database:
// 1. Import your database client (e.g., psycopg2 adapter via API)
// 2. Create a login API endpoint that validates credentials
// 3. Replace the mock authentication below with actual API call
// 4. Store session/JWT token for authenticated requests

interface LoginFormData {
  username: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Input validation
    if (!formData.username.trim()) {
      setError('Please enter your username');
      setIsLoading(false);
      return;
    }
    if (!formData.password.trim()) {
      setError('Please enter your password');
      setIsLoading(false);
      return;
    }

    // TODO: Replace with actual database authentication
    // Example API call structure:
    // try {
    //   const response = await fetch('/api/auth/login', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       username: formData.username,
    //       password: formData.password
    //     })
    //   });
    //   const data = await response.json();
    //   if (data.success) {
    //     localStorage.setItem('authToken', data.token);
    //     localStorage.setItem('user', JSON.stringify(data.user));
    //     navigate('/dashboard');
    //   } else {
    //     setError(data.message || 'Invalid credentials');
    //   }
    // } catch (err) {
    //   setError('Connection error. Please try again.');
    // }

    // Mock authentication for demo (remove when database is connected)
    setTimeout(() => {
      // Simulating successful login
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify({
        username: formData.username,
        role: 'teacher',
        name: 'Teacher'
      }));
      setIsLoading(false);
      navigate('/home');
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

      {/* Right side - Login form */}
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
            <h2 className="text-2xl font-bold text-foreground">Teacher Login</h2>
            <p className="text-muted-foreground mt-1">Welcome back to Mochi!</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username field */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="#samplename"
                className="login-input"
                disabled={isLoading}
              />
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="#samplepassword"
                  className="login-input pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            <div className="text-right">
              <Link to="/forgot-password" className="login-link text-sm">
                Forgot Password ?
              </Link>
            </div>

            {/* Login button */}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                <LogIn size={20} />
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;
