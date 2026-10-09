"use client";

import { useActionState, useState } from "react";
import { upsertWorkshop, deleteWorkshop } from "./actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

type WorkshopType = { id: number; name: string; category: string };

type WorkshopFormProps = {
  types: WorkshopType[];
  initialData?: any;
};

export default function WorkshopForm({ types, initialData }: WorkshopFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(upsertWorkshop, { error: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!initialData || !confirm("Are you sure you want to permanently delete this workshop?")) return;
    setIsDeleting(true);
    try {
      await deleteWorkshop(initialData.id);
      router.push("/");
    } catch (err: any) {
      alert(err.message || "Failed to delete workshop");
      setIsDeleting(false);
    }
  };

  // Convert Date to local datetime-local format for the input
  let defaultDate = "";
  if (initialData?.schedule_date) {
    const d = new Date(initialData.schedule_date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    defaultDate = d.toISOString().slice(0, 16);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-2xl mx-auto">
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {initialData ? "Edit Workshop" : "Create New Workshop"}
          </h3>
        </div>
        {initialData && (
          <button 
            type="button" 
            onClick={handleDelete}
            disabled={isDeleting || isPending}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
          >
            {isDeleting ? 'Deleting...' : 'Delete Workshop'}
          </button>
        )}
      </div>
      
      <div className="px-6 py-6">
        {state?.error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm relative">
            <span className="block sm:inline">{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-6">
          {initialData && <input type="hidden" name="id" value={initialData.id} />}
          
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">Workshop Code</label>
              <input type="text" id="code" name="code" required defaultValue={initialData?.code || ""} placeholder="WS-101" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            
            <div>
              <label htmlFor="type_id" className="block text-sm font-medium text-gray-700">Workshop Type</label>
              <select id="type_id" name="type_id" required defaultValue={initialData?.type_id || ""} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white">
                <option value="" disabled>Select type...</option>
                {types.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" id="title" name="title" required defaultValue={initialData?.title || ""} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            <div>
              <label htmlFor="instructor" className="block text-sm font-medium text-gray-700">Instructor Name</label>
              <input type="text" id="instructor" name="instructor" required defaultValue={initialData?.instructor || ""} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            <div>
              <label htmlFor="schedule_date" className="block text-sm font-medium text-gray-700">Date & Time</label>
              <input type="datetime-local" id="schedule_date" name="schedule_date" required defaultValue={defaultDate} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Total Capacity</label>
              <input type="number" id="capacity" name="capacity" min="1" required defaultValue={initialData?.capacity || 20} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
              <select id="location" name="location" required defaultValue={initialData?.location || ""} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white">
                <option value="" disabled>Select location...</option>
                <option value="Colombo">Colombo</option>
                <option value="Nugegoda">Nugegoda</option>
                <option value="Mount Lavinia">Mount Lavinia</option>
              </select>
            </div>

            <div className="sm:col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="duration_hours" className="block text-sm font-medium text-gray-700">Duration (Hours)</label>
                <input type="number" id="duration_hours" name="duration_hours" min="0" required defaultValue={initialData?.duration ? Math.floor(initialData.duration / 60) : 1} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <div>
                <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700">Duration (Minutes)</label>
                <input type="number" id="duration_minutes" name="duration_minutes" min="0" max="59" required defaultValue={initialData?.duration ? initialData.duration % 60 : 0} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select id="status" name="status" required defaultValue={initialData?.status || "published"} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white">
                <option value="published">Published (Active)</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div className="pt-5 flex justify-end space-x-3 border-t border-gray-200">
            <Link 
              href="/"
              className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={isPending || isDeleting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? 'Saving...' : 'Save Workshop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
