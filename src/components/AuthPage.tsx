import { useState, type FormEvent } from 'react';
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  Loader2,
  MailCheck,
  Moon,
  Sun,
} from 'lucide-react';
import type { AuthActionResult, SignUpResult } from '../hooks/useAuth';
import type { Theme } from '../hooks/useTheme';

interface AuthPageProps {
  onSignIn: (email: string, password: string) => Promise<AuthActionResult>;
  onSignUp: (email: string, password: string) => Promise<SignUpResult>;
  theme: Theme;
  onToggleTheme: () => void;
}

export function AuthPage({ onSignIn, onSignUp, theme, onToggleTheme }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);

  const switchMode = (nextMode: 'login' | 'signup') => {
    setMode(nextMode);
    setErrorMessage(null);
    setEmailConfirmationSent(false);
  };

  const validate = (): string | null => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return 'Please enter your email address.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return 'Please enter a valid email address.';
    }
    if (!password) {
      return 'Please enter your password.';
    }
    if (mode === 'signup' && password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        const res = await onSignIn(email, password);
        if (res.error) {
          setErrorMessage(res.error);
        }
      } else {
        const res = await onSignUp(email, password);
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.needsEmailConfirmation) {
          setEmailConfirmationSent(true);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 dark:bg-[#0A0A0B]">
      {/* Theme Toggle */}
      <div className="absolute top-5 right-5 sm:top-6 sm:right-6">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] dark:border-[#26262C] dark:bg-[#111114] dark:text-[#A1A1AA] dark:hover:bg-[#18181C] dark:hover:text-[#F5F5F7]"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <main className="w-full max-w-[400px]">
        {emailConfirmationSent ? (
          <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm dark:border-[#26262C] dark:bg-[#111114]">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#2A52BE]/15 text-[#2A52BE] dark:text-[#5B82E8]">
              <MailCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900 dark:text-[#F5F5F7]">
              Check your email
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#A1A1AA]">
              We sent a confirmation link to{' '}
              <span className="font-semibold text-slate-900 dark:text-[#F5F5F7]">{email}</span>.
              Open the link to verify your account, then log in.
            </p>
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[#2A52BE] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#345FD1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#111114]"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm dark:border-[#26262C] dark:bg-[#111114]">
            {/* App Name Header */}
            <div className="mb-6 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2A52BE]">
                <Check className="h-4 w-4 stroke-[2.75] text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-[#F5F5F7]">
                TaskFlow
              </span>
            </div>

            <h1 className="text-lg font-semibold text-slate-900 dark:text-[#F5F5F7]">
              {mode === 'login' ? 'Log in to your account' : 'Create your account'}
            </h1>

            {errorMessage && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2.5 rounded-lg border border-[#FF2E93]/35 bg-[#FF2E93]/10 px-3.5 py-2.5 text-sm text-[#D91B77] dark:text-[#FF62AF]"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-sm font-medium text-slate-700 dark:text-[#A1A1AA]"
                >
                  Email
                </label>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-[#2A52BE] focus:outline-none focus:ring-2 focus:ring-[#2A52BE]/30 dark:border-[#26262C] dark:bg-[#18181C] dark:text-[#F5F5F7] dark:placeholder-[#A1A1AA]/50 dark:focus:border-[#5B82E8]"
                />
              </div>

              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-sm font-medium text-slate-700 dark:text-[#A1A1AA]"
                >
                  Password
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="auth-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter password'}
                    className="block w-full rounded-lg border border-slate-200 bg-white py-2.5 pr-10 pl-3.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-[#2A52BE] focus:outline-none focus:ring-2 focus:ring-[#2A52BE]/30 dark:border-[#26262C] dark:bg-[#18181C] dark:text-[#F5F5F7] dark:placeholder-[#A1A1AA]/50 dark:focus:border-[#5B82E8]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] dark:text-[#A1A1AA] dark:hover:text-[#F5F5F7]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2A52BE] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#345FD1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-[#111114]"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                <span>
                  {submitting
                    ? mode === 'login'
                      ? 'Logging in...'
                      : 'Signing up...'
                    : mode === 'login'
                      ? 'Login'
                      : 'Sign up'}
                </span>
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500 dark:text-[#A1A1AA]">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                className="font-medium text-[#2A52BE] transition-colors hover:text-[#345FD1] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] dark:text-[#5B82E8] dark:hover:text-[#7FA0F2]"
              >
                {mode === 'login' ? 'Sign up' : 'Login'}
              </button>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
