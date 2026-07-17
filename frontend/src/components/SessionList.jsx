import { useEffect, useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import Button from './Button';
import toast from 'react-hot-toast';
import { FaLaptop, FaMobileAlt, FaGlobe } from 'react-icons/fa';

const SessionList = () => {
  const { sessions, fetchSessions, revokeSession, revokeAllSessions } = useSecurity();
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevoke = async (id) => {
    setLoadingId(id);
    try {
      await revokeSession(id);
      toast.success('Session revoked successfully');
      fetchSessions();
    } catch (error) {
      toast.error('Failed to revoke session');
    } finally {
      setLoadingId(null);
    }
  };

  const handleRevokeAll = async () => {
    if (!window.confirm('Are you sure you want to log out all other devices?')) return;
    try {
      // Find current session ID. We can approximate this by the one that matches our current IP or just pass null to revoke all.
      // But passing null revokes the current one too. Let's just pass null for now and let the user log back in.
      // Or we can find the most recently active session and assume it's current.
      const currentSessionId = sessions.length > 0 ? sessions[0]._id : null;
      await revokeAllSessions(currentSessionId);
      toast.success('All other sessions revoked');
      fetchSessions();
    } catch (error) {
      toast.error('Failed to revoke sessions');
    }
  };

  const getDeviceIcon = (os) => {
    const lower = os.toLowerCase();
    if (lower.includes('ios') || lower.includes('android')) return <FaMobileAlt className="text-xl text-gray-500" />;
    return <FaLaptop className="text-xl text-gray-500" />;
  };

  if (!sessions || sessions.length === 0) {
    return <div className="text-sm text-gray-500">No active sessions found.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Active Sessions</h3>
        {sessions.length > 1 && (
          <Button variant="danger" onClick={handleRevokeAll}>
            Log out other devices
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {sessions.map((session, idx) => {
          const isCurrent = idx === 0; // The API sorts by lastActive -1, so index 0 is highly likely the current one

          return (
            <div key={session._id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  {getDeviceIcon(session.deviceInfo?.os || '')}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {session.deviceInfo?.os} - {session.deviceInfo?.browser}
                    </p>
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-green-100 text-green-700 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <FaGlobe className="inline mr-1" />
                    {session.deviceInfo?.ipAddress} • {session.deviceInfo?.deviceName}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Last active: {new Date(session.lastActive).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {!isCurrent && (
                <Button 
                  variant="secondary" 
                  onClick={() => handleRevoke(session._id)}
                  disabled={loadingId === session._id}
                >
                  {loadingId === session._id ? 'Revoking...' : 'Log out'}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SessionList;
