// Login Page
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts';
import { Mail, Lock, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '../utils';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { redirect_url } = await login(data);
      navigate(redirect_url);
    } catch (err) {
      const appError = err as { status?: number; message?: string; errors?: Record<string, string[]> };
      if (appError.status === 422 && appError.errors) {
        // Set field errors
        Object.entries(appError.errors).forEach(([field, messages]) => {
          if (field === 'email') {
            // Handle general validation error
            setError(messages[0]);
          }
        });
        if (!error) {
          setError(appError.message || 'Invalid credentials');
        }
      } else if (appError.status === 403) {
        setError('Account is inactive. Please contact administrator.');
      } else {
        setError(appError.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleDemoLogin = (email: string, password: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  // Demo credentials hint
  const demoCredentials = [
    { role: 'Admin', email: 'admin@example.com', password: 'password' },
    { role: 'Registrar', email: 'registrar@example.com', password: 'password' },
    { role: 'Instructor', email: 'instructor1@example.com', password: 'password' },
    { role: 'Student', email: 'student1@example.com', password: 'password' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Error Alert */}
      {error && (
        <div
          className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
          <input
            {...register('email')}
            id="email"
            type="email"
            autoComplete="email"
            className={cn(
              'w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
              'disabled:bg-slate-50 disabled:cursor-not-allowed',
              errors.email && 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
            )}
            placeholder="admin@example.com"
            disabled={isSubmitting || authLoading}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
        </div>
        {errors.email && (
          <p id="email-error" className="mt-1.5 text-sm text-rose-600" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
          <input
            {...register('password')}
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className={cn(
              'w-full pl-10 pr-12 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
              'disabled:bg-slate-50 disabled:cursor-not-allowed',
              errors.password && 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
            )}
            placeholder="••••••••"
            disabled={isSubmitting || authLoading}
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="mt-1.5 text-sm text-rose-600" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || authLoading}
        className={cn(
          'w-full py-3 px-4 rounded-xl font-semibold text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isSubmitting || authLoading
            ? 'bg-primary-500/50 text-white cursor-wait'
            : 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm'
        )}
      >
        {isSubmitting || authLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Signing in...
          </span>
        ) : (
          'Sign In'
        )}
      </button>

      {/* Demo Credentials */}
      <div className="border-t border-slate-200 pt-6">
        <p className="text-xs text-slate-500 text-center mb-3">Demo Credentials</p>
        <div className="space-y-2 text-xs">
          {demoCredentials.map((cred, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleDemoLogin(cred.email, cred.password)}
              className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-slate-600"
            >
              <span className="font-medium text-slate-900">{cred.role}:</span>{' '}
              <code className="bg-slate-200 px-1.5 rounded">{cred.email}</code> /{' '}
              <code className="bg-slate-200 px-1.5 rounded">{cred.password}</code>
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 text-center mt-3">
          Click any credential above to auto-fill the form
        </p>
      </div>
    </form>
  );
};