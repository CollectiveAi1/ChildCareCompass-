import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../lib/api';
import { useStore } from '../store/useStore';
import { Logo } from '../components/Logo';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, showToast } = useStore();
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demo123');

  const loginMutation = useMutation({
    mutationFn: () => authApi.login(email, password),
    onSuccess: (response) => {
      const { user, token } = response.data;
      login(user, token);
      showToast('Login successful!', 'success');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.error || 'Login failed', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email', 'error');
      return;
    }
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-brand-teal flex items-center justify-center p-6 text-center font-sans">
      <div className="bg-white p-12 rounded-[64px] shadow-3xl w-full max-w-lg border border-white/50 animate-in zoom-in duration-500">
        <div className="mb-10">
          <Logo size={180} showTagline={true} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex bg-slate-50 rounded-3xl p-1.5 border border-slate-100">
            {(['ADMIN', 'TEACHER', 'PARENT'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-4 rounded-2xl text-xs font-black transition-all ${
                  role === r
                    ? 'bg-white text-brand-teal shadow-xl shadow-brand-teal/10'
                    : 'text-slate-400'
                }`}
              >
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <input
            type="email"
            placeholder="Work Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[32px] outline-none focus:ring-4 focus:ring-brand-teal/10 transition-all font-bold text-slate-900 placeholder:text-slate-300"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[32px] outline-none focus:ring-4 focus:ring-brand-teal/10 transition-all font-bold text-slate-900 placeholder:text-slate-300"
            required
          />

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-6 bg-brand-teal text-white font-black text-2xl rounded-[32px] shadow-2xl shadow-brand-teal/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-xs text-slate-400">
          <p>Demo Mode: Use any email with password "demo123"</p>
          <p className="mt-2">Note: Database setup required for full functionality</p>
        </div>
      </div>
    </div>
  );
};
