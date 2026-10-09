"use client";

import { useActionState, useRef, useEffect } from "react";
import { registerAttendee } from "./actions";

export default function RegistrationForm({ 
  workshopId, 
  title,
  code,
  capacity,
  registeredCount,
  isFull 
}: { 
  workshopId: number;
  title: string;
  code: string;
  capacity: number;
  registeredCount: number;
  isFull: boolean;
}) {
  const [state, formAction, isPending] = useActionState(registerAttendee, {
    error: "",
    success: "",
  } as any);
  
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state.success]);

  return (
    <div className="bg-brand-surface rounded-2xl shadow-sm border border-brand-border overflow-hidden mt-6">
      <div className="px-6 py-5 border-b border-brand-border bg-brand-bg/50 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg leading-6 font-bold text-brand-text">Register Attendee</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-primary text-brand-bg">
            {code}
          </span>
        </div>
        <p className="text-sm text-brand-text font-medium">{title}</p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-brand-text-muted uppercase font-bold tracking-wider">Availability</span>
          <span className={`text-sm font-bold ${isFull ? 'text-red-600' : 'text-brand-text'}`}>
            {capacity - registeredCount} seats left
          </span>
        </div>
        {isFull && (
          <span className="mt-2 inline-flex items-center justify-center w-full px-3 py-1 rounded-md text-sm font-bold bg-red-100 text-red-800">
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
              <label htmlFor="name" className="block text-sm font-medium text-brand-text">
                Attendee Name
              </label>
              <div className="mt-1">
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  required 
                  className="appearance-none block w-full px-3 py-2 border border-brand-border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100 disabled:text-gray-500 bg-brand-surface" 
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-text">
                Attendee Email
              </label>
              <div className="mt-1">
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required 
                  className="appearance-none block w-full px-3 py-2 border border-brand-border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100 disabled:text-gray-500 bg-brand-surface" 
                />
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isPending}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? 'Processing...' : isFull ? 'Join Waitlist' : 'Confirm Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
