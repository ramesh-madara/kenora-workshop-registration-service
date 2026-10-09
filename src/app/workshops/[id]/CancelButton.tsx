"use client";

import { useState } from "react";
import { cancelRegistration } from "./actions";

export default function CancelButton({ registrationId, workshopId }: { registrationId: number, workshopId: number }) {
  const [isPending, setIsPending] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this registration?")) return;
    setIsPending(true);
    try {
      await cancelRegistration(registrationId, workshopId);
    } catch (err: any) {
      alert(err.message || "Failed to cancel registration.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button 
      onClick={handleCancel}
      disabled={isPending}
      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
    >
      {isPending ? 'Cancelling...' : 'Cancel Seat'}
    </button>
  );
}
