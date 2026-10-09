"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

type AuditLog = {
  id: number;
  action_timestamp: string;
  action: string;
  attendee_name: string;
  performed_by_email: string;
  performed_by_role: string;
};

export default function AuditTrailModal({ auditLog }: { auditLog: AuditLog[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900 bg-opacity-50 backdrop-blur-sm p-4 sm:p-0">
      <div className="relative w-full max-w-4xl max-h-full bg-white rounded-2xl shadow-xl flex flex-col my-8">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-medium text-gray-900">Immutable Audit Trail</h3>
            <p className="mt-1 text-sm text-gray-500">Chronological timeline of all operations on this workshop.</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendee</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performed By</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLog.map((log) => {
                  let badgeClass = 'bg-gray-100 text-gray-800';
                  if (log.action === 'registered') badgeClass = 'bg-green-100 text-green-800';
                  if (log.action === 'cancelled') badgeClass = 'bg-red-100 text-red-800';
                  if (log.action === 'waitlisted') badgeClass = 'bg-orange-100 text-orange-800';
                  if (log.action === 'promoted') badgeClass = 'bg-blue-100 text-blue-800';

                  return (
                    <tr key={log.id} className={`${log.action === 'cancelled' ? 'bg-red-50' : 'bg-white'}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.action_timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${badgeClass}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${log.action === 'cancelled' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {log.attendee_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.performed_by_email} <span className="text-gray-400">({log.performed_by_role})</span>
                      </td>
                    </tr>
                  )
                })}
                {auditLog.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                      No audit history available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mt-4 w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        View Audit Trail
      </button>

      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
