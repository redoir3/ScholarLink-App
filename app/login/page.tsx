'use client';
import { supabase } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) router.push('/submit');
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('Please enter email and password');
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage('Login failed: ' + error.message);
    setIsLoading(false);
  };

  const handleSignup = async () => {
    if (!email || password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { emailRedirectTo: window.location.origin + '/submit' }
    });
    if (error) setMessage('Signup failed: ' + error.message);
    else setMessage('Signup successful! Check your email or try logging in.');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">LocalLink</h1>
          <p className="text-gray-600 mt-2">Sign in to submit or review scholarships</p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 border border-border rounded-xl"
          />
          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 border border-border rounded-xl"
          />

          <button onClick={handleLogin} disabled={isLoading} className="btn-primary w-full py-3">
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          <button onClick={handleSignup} disabled={isLoading} className="w-full py-3 border border-accent text-accent rounded-xl hover:bg-accent hover:text-white transition">
            Create Account
          </button>

          {message && <p className="text-center text-sm mt-4">{message}</p>}
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          For demo purposes only • Real organizations will be reviewed
        </p>
      </div>
    </div>
  );
}