'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorMessage } from '@/components/ui/error-message';
import { Wrench } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        // Store token in localStorage for API client
        const session = await fetch('/api/auth/session').then(res => res.json());
        if (session?.user?.token) {
          localStorage.setItem('token', session.user.token);
          localStorage.setItem('user', JSON.stringify(session.user));
        }
        
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Card className="w-full max-w-md backdrop-blur-xl bg-white/95 shadow-2xl border-none relative z-10">
        <CardHeader className="text-center space-y-4 bg-gradient-to-br from-slate-50 to-blue-50/50">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/50">
              <Wrench className="h-10 w-10 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome to GearGuard
            </CardTitle>
            <CardDescription className="text-base mt-2 text-slate-600">
              Sign in to manage your maintenance requests
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <ErrorMessage message={error} type="error" />}

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@gearguard.com"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              className="w-full shadow-lg shadow-blue-500/50"
              isLoading={isLoading}
            >
              Sign In
            </Button>

            <div className="text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <Link href="/register" className="font-semibold text-blue-600 hover:text-indigo-600 transition-colors">
                Register here
              </Link>
            </div>

            {/* Test Credentials */}
            <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 shadow-inner">
              <p className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse inline-block"></span>
                Test Credentials
              </p>
              <div className="space-y-1.5 text-xs text-slate-600">
                <p><strong>Admin:</strong> admin@gearguard.com / password123</p>
                <p><strong>Manager:</strong> manager1@gearguard.com / password123</p>
                <p><strong>Technician:</strong> tech.mech1@gearguard.com / password123</p>
                <p><strong>User:</strong> user1@gearguard.com / password123</p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
