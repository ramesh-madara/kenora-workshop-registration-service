"use client";

export default function FilterBar({ 
  currentParams 
}: { 
  currentParams: Record<string, string>
}) {
  return (
    <form method="GET" action="/" className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        
        <div>
          <label htmlFor="fromDate" className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
          <input 
            type="date" 
            id="fromDate" 
            name="fromDate" 
            defaultValue={currentParams.fromDate || ""}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
          />
        </div>
        
        <div>
          <label htmlFor="toDate" className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
          <input 
            type="date" 
            id="toDate" 
            name="toDate" 
            defaultValue={currentParams.toDate || ""}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
          />
        </div>
        
        <div>
          <label htmlFor="status" className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select 
            id="status" 
            name="status"
            defaultValue={currentParams.status || ""}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="location" className="block text-xs font-medium text-gray-700 mb-1">Location</label>
          <select 
            id="location" 
            name="location"
            defaultValue={currentParams.location || ""}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
          >
            <option value="">All Locations</option>
            <option value="Colombo">Colombo</option>
            <option value="Nugegoda">Nugegoda</option>
            <option value="Mount Lavinia">Mount Lavinia</option>
          </select>
        </div>
        
        <div className="flex flex-col justify-end space-y-3">
          <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
            <input 
              type="checkbox" 
              name="availableOnly" 
              value="true"
              defaultChecked={currentParams.availableOnly === "true"}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span>Has Available Seats</span>
          </label>
          
          <div className="flex space-x-2">
            <button 
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Filter
            </button>
            <a 
              href="/"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              Reset
            </a>
          </div>
        </div>
        
      </div>
    </form>
  );
}
