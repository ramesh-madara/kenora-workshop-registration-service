"use client";

import { useActionState, useRef } from "react";
import { registerAttendee } from "./actions";

export default function RegistrationForm({ workshopId, isFull }: { workshopId: number, isFull: boolean }) {
  const [state, formAction, isPending] = useActionState(registerAttendee, {
    error: null,
    success: null,
  });
  
  const formRef = useRef<HTMLFormElement>(null);

  if (state.success && formRef.current) {
    formRef.current.reset();
    state.success = null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-6">
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Attendee Registration</h3>
          <p className="mt-1 text-sm text-gray-500">Quick-intake form for phone and walk-in registrations.</p>
        </div>
        {isFull && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            WORKSHOP FULL
          </span>
        )}
      </div>
      
      <div className="px-6 py-6">
        {state.error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm relative" role="alert">
            <span className="block sm:inline">{state.error}</span>
          </div>
        )}
        
        {state.success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm relative" role="alert">
            <span className="block sm:inline">{state.success}</span>
          </div>
        )}

        <form action={formAction} ref={formRef} className="space-y-6">
          <input type="hidden" name="workshop_id" value={workshopId} />
          
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Attendee Name
              </label>
              <div className="mt-1">
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  required 
                  disabled={isFull}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500" 
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Attendee Email
              </label>
              <div className="mt-1">
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required 
                  disabled={isFull}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500" 
                />
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isPending || isFull}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? 'Processing...' : 'Confirm Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
