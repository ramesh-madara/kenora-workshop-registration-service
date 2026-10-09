"use client";

import { useActionState } from "react";
import { loginUser } from "@/app/actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, {
    error: null,
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Staff Sign In
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
              <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 inline-block text-left">
                <strong className="text-gray-700 block mb-1 text-center">Dev Quick-Reference (pw123):</strong>
                Admin: admin <br/>
                Manager: manager <br/>
                Staff: staff
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
