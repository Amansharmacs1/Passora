/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useCallback } from 'react';
import api from '../services/api';

const SecurityContext = createContext();

export const SecurityProvider = ({ children }) => {
  const [securityReport, setSecurityReport] = useState(null);
  const [scoreTrend, setScoreTrend] = useState([]);
  const [activityTimeline, setActivityTimeline] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatedHistory, setGeneratedHistory] = useState([]); // Array of strings

  const fetchSecurityReport = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/security/report');
      setSecurityReport(response.data);
    } catch (error) {
      console.error('Failed to fetch security report', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchScoreTrend = useCallback(async () => {
    try {
      const response = await api.get('/security/score-trend');
      setScoreTrend(response.data);
    } catch (error) {
      console.error('Failed to fetch score trend', error);
    }
  }, []);

  const fetchActivityTimeline = useCallback(async () => {
    try {
      const response = await api.get('/activity');
      setActivityTimeline(response.data);
    } catch (error) {
      console.error('Failed to fetch activity timeline', error);
    }
  }, []);

  const fetchLoginHistory = useCallback(async () => {
    try {
      const response = await api.get('/activity/login-history');
      setLoginHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch login history', error);
    }
  }, []);

  const logActivityEvent = async (action, vaultId = null, details = '') => {
    try {
      await api.post('/activity/log', { action, vaultId, details });
      // Optionally re-fetch timeline, but generally we just let it fetch on page load
    } catch (error) {
      console.error('Failed to log activity', error);
    }
  };

  const getPasswordHistory = async (vaultId) => {
    try {
      const response = await api.get(`/password/history/${vaultId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch password history', error);
      return [];
    }
  };

  const addGeneratedPassword = (pwd) => {
    setGeneratedHistory(prev => {
      const updated = [pwd, ...prev.filter(p => p !== pwd)];
      return updated.slice(0, 10); // keep last 10
    });
  };

  // Master Password
  const setupMasterPassword = async (password) => {
    const res = await api.post('/master/create', { password });
    return res.data;
  };
  const verifyMasterPassword = async (password) => {
    const res = await api.post('/master/verify', { password });
    return res.data;
  };
  const changeMasterPassword = async (currentPassword, newPassword) => {
    const res = await api.put('/master/change', { currentPassword, newPassword });
    return res.data;
  };
  const removeMasterPassword = async (password) => {
    const res = await api.delete('/master/remove', { data: { password } });
    return res.data;
  };

  // 2FA
  const setup2FA = async () => {
    const res = await api.post('/2fa/setup');
    return res.data;
  };
  const verify2FASetup = async (token) => {
    const res = await api.post('/2fa/verify-setup', { token });
    return res.data;
  };
  const disable2FA = async (password, token) => {
    const res = await api.delete('/2fa', { data: { password, token } });
    return res.data;
  };

  // Sessions
  const [sessions, setSessions] = useState([]);
  const fetchSessions = useCallback(async () => {
    try {
      const res = await api.get('/sessions');
      setSessions(res.data);
    } catch (error) {
      console.error('Failed to fetch sessions', error);
    }
  }, []);
  const revokeSession = async (id) => {
    const res = await api.delete(`/sessions/${id}`);
    return res.data;
  };
  const revokeAllSessions = async (currentSessionId) => {
    const res = await api.delete('/sessions', { data: { currentSessionId } });
    return res.data;
  };

  // Sharing
  const createShare = async (vaultId, expiresInHours, maxViews) => {
    const res = await api.post('/share', { vaultId, expiresInHours, maxViews });
    return res.data;
  };
  const getShareHistory = async () => {
    const res = await api.get('/share');
    return res.data;
  };
  const revokeShare = async (id) => {
    const res = await api.delete(`/share/${id}`);
    return res.data;
  };

  // Passkeys
  const [passkeys, setPasskeys] = useState([]);
  const fetchPasskeys = useCallback(async () => {
    try {
      const res = await api.get('/webauthn/passkeys');
      setPasskeys(res.data);
    } catch (error) {
      console.error('Failed to fetch passkeys', error);
    }
  }, []);
  
  const registerPasskey = async () => {
    const { startRegistration } = await import('@simplewebauthn/browser');
    
    // 1. Get options
    const optRes = await api.get('/webauthn/register/generate-options');
    const options = optRes.data;

    // 2. Prompt user
    const regResp = await startRegistration(options);

    // 3. Verify
    const verifyRes = await api.post('/webauthn/register/verify', {
      body: regResp,
      deviceName: window.navigator.userAgent // simplistic device naming
    });

    return verifyRes.data;
  };

  const deletePasskey = async (id) => {
    const res = await api.delete(`/webauthn/passkeys/${id}`);
    return res.data;
  };

  // Breaches
  const scanBreaches = async () => {
    const res = await api.post('/breach/scan-vault');
    return res.data;
  };

  return (
    <SecurityContext.Provider value={{
      securityReport,
      scoreTrend,
      activityTimeline,
      loginHistory,
      loading,
      generatedHistory,
      fetchSecurityReport,
      fetchScoreTrend,
      fetchActivityTimeline,
      fetchLoginHistory,
      logActivityEvent,
      getPasswordHistory,
      addGeneratedPassword,
      setupMasterPassword,
      verifyMasterPassword,
      changeMasterPassword,
      removeMasterPassword,
      setup2FA,
      verify2FASetup,
      disable2FA,
      sessions,
      fetchSessions,
      revokeSession,
      revokeAllSessions,
      createShare,
      getShareHistory,
      revokeShare,
      passkeys,
      fetchPasskeys,
      registerPasskey,
      deletePasskey,
      scanBreaches
    }}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => useContext(SecurityContext);
