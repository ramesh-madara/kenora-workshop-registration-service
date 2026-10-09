"use client";

import { useEffect, useRef, useState } from "react";

export default function AuditModal({ 
  auditLog, 
  workshopAuditLog 
}: { 
  auditLog: any[], 
  workshopAuditLog: any[] 
}) {
  const [isAttendeeOpen, setIsAttendeeOpen] = useState(false);
  const [isWorkshopOpen, setIsWorkshopOpen] = useState(false);
  
  const attendeeDialogRef = useRef<HTMLDialogElement>(null);
  const workshopDialogRef = useRef<HTMLDialogElement>(null);

  // Attendee Modal Effect
  useEffect(() => {
    const dialog = attendeeDialogRef.current;
    if (!dialog) return;
    if (isAttendeeOpen) dialog.showModal();
    else dialog.close();
  }, [isAttendeeOpen]);

  // Workshop Modal Effect
  useEffect(() => {
    const dialog = workshopDialogRef.current;
    if (!dialog) return;
    if (isWorkshopOpen) dialog.showModal();
    else dialog.close();
  }, [isWorkshopOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAttendeeOpen) setIsAttendeeOpen(false);
        if (isWorkshopOpen) setIsWorkshopOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isAttendeeOpen, isWorkshopOpen]);

  return (
    <div className="flex gap-2">
      {/* Attendee Audit Button */}
      <button 
        onClick={() => setIsAttendeeOpen(true)}
        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
      >
        Registration Audit
      </button>

      {/* Workshop Audit Button */}
      <button 
        onClick={() => setIsWorkshopOpen(true)}
        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
      >
        Workshop Audit
      </button>

      {/* Attendee Modal */}
      <dialog 
        ref={attendeeDialogRef} 
        onClick={(e) => { if (e.target === attendeeDialogRef.current) setIsAttendeeOpen(false) }}
        onClose={() => setIsAttendeeOpen(false)}
        className="rounded-2xl shadow-2xl p-0 backdrop:bg-black/40 backdrop:backdrop-blur-sm max-w-4xl w-[90vw] mx-auto mt-20 mb-auto" 
      >
        <div className="bg-white p-6 md:p-8 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Attendee Registration Trail</h2>
              <p className="text-sm text-gray-500 mt-1">Press Esc to close</p>
            </div>
            <button onClick={() => setIsAttendeeOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
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
                {auditLog.map((log) => (
                  <tr key={log.id} className={`${log.action === 'cancelled' ? 'bg-red-50' : 'bg-white'}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.action_timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.action === 'registered' || log.action === 'promoted' 
                          ? 'bg-green-100 text-green-800' 
                          : log.action === 'waitlisted' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800 capitalize'
                      }`}>
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
                ))}
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
      </dialog>

      {/* Workshop Modal */}
      <dialog 
        ref={workshopDialogRef} 
        onClick={(e) => { if (e.target === workshopDialogRef.current) setIsWorkshopOpen(false) }}
        onClose={() => setIsWorkshopOpen(false)}
        className="rounded-2xl shadow-2xl p-0 backdrop:bg-black/40 backdrop:backdrop-blur-sm max-w-4xl w-[90vw] mx-auto mt-20 mb-auto" 
      >
        <div className="bg-white p-6 md:p-8 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Workshop Edit History</h2>
              <p className="text-sm text-gray-500 mt-1">Press Esc to close</p>
            </div>
            <button onClick={() => setIsWorkshopOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performed By</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workshopAuditLog.map((log) => (
                  <tr key={log.id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                      {log.details}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.performed_by_email} <span className="text-gray-400">({log.performed_by_role})</span>
                    </td>
                  </tr>
                ))}
                {workshopAuditLog.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                      No workshop edit history available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </dialog>
    </div>
  );
}
