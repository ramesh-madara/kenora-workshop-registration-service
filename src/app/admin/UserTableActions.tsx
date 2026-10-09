"use client";

import { useState, useActionState, useRef, useEffect } from "react";
import { deleteUser, updateUser } from "./actions";

type UserProps = {
  id: number;
  email: string;
  role: string;
};

export default function UserTableActions({ user }: { user: UserProps }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [state, formAction, isPending] = useActionState(updateUser, {
    error: null,
    success: null,
  });

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success && isEditing) {
      setIsEditing(false);
    }
  }, [state?.success, isEditing]);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${user.email}?`)) return;
    setIsDeleting(true);
    try {
      await deleteUser(user.id);
    } catch (err: any) {
      alert(err.message || "Failed to delete user.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex justify-end space-x-3">
      <button
        onClick={() => setIsEditing(true)}
        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium transition-colors"
      >
        Edit
      </button>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-red-600 hover:text-red-900 text-sm font-medium transition-colors disabled:opacity-50"
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col text-left">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Edit User Account</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {state?.error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {state.error}
                </div>
              )}

              <form action={formAction} ref={formRef} className="space-y-4">
                <input type="hidden" name="id" value={user.id} />
                
                <div>
                  <label htmlFor={`email-${user.id}`} className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" id={`email-${user.id}`} name="email" required defaultValue={user.email} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                
                <div>
                  <label htmlFor={`password-${user.id}`} className="block text-sm font-medium text-gray-700">New Password <span className="text-gray-400 font-normal">(Leave blank to keep current)</span></label>
                  <input type="password" id={`password-${user.id}`} name="password" placeholder="••••••••" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                
                <div>
                  <label htmlFor={`role-${user.id}`} className="block text-sm font-medium text-gray-700">Role</label>
                  <select id={`role-${user.id}`} name="role" required defaultValue={user.role} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white">
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                
                <div className="pt-4 flex justify-end space-x-3">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                    Cancel
                  </button>
                  <button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                    {isPending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
