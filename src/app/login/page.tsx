"use client";

import { useActionState, useEffect } from "react";
import { loginUser } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginUser, {
    error: "",
    success: false,
    redirectUrl: "",
  } as any);

  useEffect(() => {
    if (state.success && state.redirectUrl) {
      router.push(state.redirectUrl);
    }
  }, [state, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Staff Sign In..
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to access the workshop manager
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {state.error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative text-sm" role="alert">
              <span className="block sm:inline">{state.error}</span>
            </div>
          )}

          <form action={formAction} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Username or Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  placeholder="admin"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="text-center">
              <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-4 inline-block text-left w-full border border-gray-200">
                <strong className="text-gray-700 block mb-3 text-center text-sm">Dev Quick-Reference</strong>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-100 shadow-sm">
                    <span className="w-20 font-medium">Admin:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-gray-800 font-mono flex-1 mx-2 text-center">admin</code>
                    <button type="button" onClick={() => navigator.clipboard.writeText('admin')} className="text-blue-600 hover:text-blue-800 border border-blue-200 rounded px-2 py-1 bg-blue-50 hover:bg-blue-100 transition-colors">Copy</button>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-100 shadow-sm">
                    <span className="w-20 font-medium">Manager:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-gray-800 font-mono flex-1 mx-2 text-center">manager</code>
                    <button type="button" onClick={() => navigator.clipboard.writeText('manager')} className="text-blue-600 hover:text-blue-800 border border-blue-200 rounded px-2 py-1 bg-blue-50 hover:bg-blue-100 transition-colors">Copy</button>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-100 shadow-sm">
                    <span className="w-20 font-medium">Staff:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-gray-800 font-mono flex-1 mx-2 text-center">staff</code>
                    <button type="button" onClick={() => navigator.clipboard.writeText('staff')} className="text-blue-600 hover:text-blue-800 border border-blue-200 rounded px-2 py-1 bg-blue-50 hover:bg-blue-100 transition-colors">Copy</button>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded border border-gray-100 shadow-sm mt-4 relative top-1">
                    <span className="w-20 font-bold text-gray-700">Password:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-gray-800 font-mono flex-1 mx-2 text-center">pw123</code>
                    <button type="button" onClick={() => navigator.clipboard.writeText('pw123')} className="text-blue-600 hover:text-blue-800 border border-blue-200 rounded px-2 py-1 bg-blue-50 hover:bg-blue-100 transition-colors">Copy</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
