import { useEffect, useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { FaHistory, FaSignInAlt, FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaEye, FaCopy, FaKey } from 'react-icons/fa';

const ActivityLog = () => {
  const { activityTimeline, loginHistory, fetchActivityTimeline, fetchLoginHistory } = useSecurity();
  const [activeTab, setActiveTab] = useState('activity'); // 'activity' | 'login'

  useEffect(() => {
    fetchActivityTimeline();
    fetchLoginHistory();
  }, [fetchActivityTimeline, fetchLoginHistory]);

  const getActionIcon = (action) => {
    switch (action) {
      case 'Added': return <FaPlus className="text-green-500" />;
      case 'Edited': return <FaEdit className="text-blue-500" />;
      case 'Deleted': return <FaTrash className="text-red-500" />;
      case 'Viewed': return <FaEye className="text-purple-500" />;
      case 'Copied': return <FaCopy className="text-gray-500" />;
      case 'Login': return <FaSignInAlt className="text-green-600" />;
      case 'Logout': return <FaSignOutAlt className="text-red-600" />;
      case 'Generated': return <FaKey className="text-yellow-500" />;
      default: return <FaHistory className="text-gray-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activity Log</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Track all events, logins, and changes to your vault.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button 
            className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'activity' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('activity')}
          >
            Vault Activity
          </button>
          <button 
            className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'login' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('login')}
          >
            Login Sessions
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'activity' && (
            <div className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-8 pb-4">
              {activityTimeline.length === 0 ? (
                <p className="text-sm text-gray-500 pl-4">No recent activity.</p>
              ) : (
                activityTimeline.map((item) => (
                  <div key={item._id} className="relative pl-8">
                    <span className="absolute -left-3.5 top-1 w-7 h-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center">
                      {getActionIcon(item.action)}
                    </span>
                    <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {item.action}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {item.details}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-gray-400">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'login' && (
            <div className="overflow-x-auto">
              {loginHistory.length === 0 ? (
                <p className="text-sm text-gray-500">No login history available.</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Device / Browser</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">IP Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Login Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Logout Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {loginHistory.map((session, idx) => (
                      <tr key={session._id} className={idx === 0 && !session.logoutTime ? 'bg-blue-50 dark:bg-blue-900/10' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{session.os}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{session.browser}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {session.ipAddress}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(session.loginTime).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {session.logoutTime ? new Date(session.logoutTime).toLocaleString() : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400">
                              Active
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
