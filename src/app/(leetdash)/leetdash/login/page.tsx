import React from 'react';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-primary">
      <div className="p-8 rounded-lg shadow-neon bg-gray-900 border border-purple-500">
        <h1 className="text-4xl font-bold mb-6 text-center">LeetDash Login</h1>
        <LoginForm />
      </div>
    </div>
  );
}
