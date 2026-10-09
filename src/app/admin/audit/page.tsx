import { getSession } from "@/lib/session";
import { query } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SystemAuditPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/");
  }

  const logsRes = await query(`
    SELECT l.id, l.action, l.entity_type, l.entity_id, l.details, l.created_at, u.email as user_email, u.role as user_role
    FROM system_audit_logs l
    JOIN users u ON l.user_id = u.id
    ORDER BY l.created_at DESC
    LIMIT 100
  `);
  const logs = logsRes.rows;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">System Audit Logs</h1>
          <p className="mt-1 text-sm text-gray-500">Track all administrative and managerial actions across the system.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.user_email}</div>
                      <div className="text-xs text-gray-500 capitalize">{log.user_role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.entity_type} #{log.entity_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.details}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                      No system audit logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
