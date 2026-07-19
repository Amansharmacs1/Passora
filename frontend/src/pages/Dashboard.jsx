import { useContext, useEffect, useState } from 'react';
import { VaultContext } from '../context/VaultContext';
import { useSecurity } from '../context/SecurityContext';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaStar, FaExclamationTriangle, FaCopy, FaCheckCircle, FaChartLine } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, 
  LineChart, Line 
} from 'recharts';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, color, link }) => (
  <Link to={link}>
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between cursor-pointer"
    >
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
      </div>
      <div className={`p-4 rounded-xl ${color}`}>
        <Icon size={24} />
      </div>
    </motion.div>
  </Link>
);

const Dashboard = () => {
  const { stats, vaults } = useContext(VaultContext);
  const { 
    securityReport, 
    scoreTrend, 
    fetchSecurityReport, 
    fetchScoreTrend,
    scanBreaches
  } = useSecurity();

  const [isScanning, setIsScanning] = useState(false);
  const [breachResult, setBreachResult] = useState(null);

  const handleScanBreaches = async () => {
    setIsScanning(true);
    setBreachResult(null);
    try {
      const result = await scanBreaches();
      setBreachResult(result);
      if (result.breachedCount > 0) {
        toast.error(`Found ${result.breachedCount} breached passwords!`);
      } else {
        toast.success('No breached passwords found. You are safe!');
      }
    } catch (error) {
      toast.error('Failed to scan for breaches');
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    fetchSecurityReport();
    fetchScoreTrend();
  }, [fetchSecurityReport, fetchScoreTrend, vaults]);

  const recentVaults = [...vaults]
    .filter(v => !v.deleted && !v.archived)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Fallback data while loading
  const report = securityReport || {
    overallScore: 0,
    totalPasswords: stats.total,
    strongPasswords: 0,
    weakPasswords: 0,
    duplicatePasswords: 0,
    oldPasswords: 0,
  };

  const scoreColor = report.overallScore >= 80 ? 'text-green-500' : report.overallScore >= 50 ? 'text-yellow-500' : 'text-red-500';
  const scoreRingColor = report.overallScore >= 80 ? 'stroke-green-500' : report.overallScore >= 50 ? 'stroke-yellow-500' : 'stroke-red-500';

  // Chart Data
  const strengthData = [
    { name: 'Strong', value: report.strongPasswords, color: '#10B981' }, // green-500
    { name: 'Weak', value: report.weakPasswords, color: '#EF4444' }, // red-500
  ];

  const trendData = scoreTrend.map(t => ({
    date: new Date(t.createdAt).toLocaleDateString(),
    score: t.overallScore
  }));

  // if trend is empty, show a mock point
  if (trendData.length === 0) {
    trendData.push({ date: new Date().toLocaleDateString(), score: report.overallScore });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Security Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Overview of your vault health and password security.</p>
        </div>
        <Button onClick={handleScanBreaches} isLoading={isScanning} className="hidden sm:flex">
            Scan for Breaches (HIBP)
        </Button>
      </div>
      
      <div className="sm:hidden">
         <Button onClick={handleScanBreaches} isLoading={isScanning} className="w-full">
            Scan for Breaches (HIBP)
         </Button>
      </div>

      {/* Primary Score & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Score Card */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overall Score</h3>
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="12" fill="none" />
              <circle 
                cx="80" cy="80" r="70" 
                className={`${scoreRingColor} transition-all duration-1000 ease-out`} 
                strokeWidth="12" 
                fill="none" 
                strokeDasharray="440" 
                strokeDashoffset={440 - (440 * report.overallScore) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-4xl font-bold ${scoreColor}`}>{report.overallScore}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">out of 100</span>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            {report.overallScore >= 80 ? 'Your vault is highly secure.' : report.overallScore >= 50 ? 'Your vault needs some improvements.' : 'Your vault is at high risk.'}
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title="Total Passwords" 
            value={report.totalPasswords} 
            icon={FaShieldAlt} 
            color="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
            link="/vault"
          />
          <StatCard 
            title="Strong Passwords" 
            value={report.strongPasswords} 
            icon={FaCheckCircle} 
            color="bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400"
            link="/vault?filter=strong" // You'll implement filter query parameters later
          />
          <StatCard 
            title="Weak Passwords" 
            value={report.weakPasswords} 
            icon={FaExclamationTriangle} 
            color="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
            link="/vault?filter=weak"
          />
          <StatCard 
            title="Duplicates" 
            value={report.duplicatePasswords} 
            icon={FaCopy} 
            color="bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400"
            link="/vault?filter=duplicate"
          />
          <StatCard 
            title="Old (>90 Days)" 
            value={report.oldPasswords} 
            icon={FaChartLine} 
            color="bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400"
            link="/vault?filter=old"
          />
          <StatCard 
            title="Favorites" 
            value={stats.favorites} 
            icon={FaStar} 
            color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-500"
            link="/vault/favorites"
          />
        </div>

      </div>

      {/* Breach Results */}
      {breachResult && (
        <div className={`rounded-2xl shadow-sm border p-6 ${breachResult.breachedCount > 0 ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/50' : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/50'}`}>
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-xl ${breachResult.breachedCount > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              <FaShieldAlt size={24} />
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-bold ${breachResult.breachedCount > 0 ? 'text-red-900 dark:text-red-400' : 'text-green-900 dark:text-green-400'}`}>
                {breachResult.breachedCount > 0 ? 'Breached Passwords Found' : 'No Breaches Found'}
              </h3>
              <p className={`text-sm mt-1 ${breachResult.breachedCount > 0 ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>
                {breachResult.breachedCount > 0 
                  ? `We found ${breachResult.breachedCount} of your passwords in known data breaches (via Have I Been Pwned). You should change these immediately.` 
                  : 'Great news! None of your passwords appear in any known data breaches.'}
              </p>
              
              {breachResult.breachedCount > 0 && (
                <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-red-100 dark:border-red-900/30">
                  <ul className="divide-y divide-red-100 dark:divide-red-900/30">
                    {breachResult.breachedVaults.map(b => (
                      <li key={b.vaultId} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{b.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{b.username}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold px-2 py-1 bg-red-100 text-red-600 rounded-full">
                            Seen {b.count.toLocaleString()} times
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Strength Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Strength Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={strengthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {strengthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#1F2937' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Score Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#9CA3AF" fontSize={12} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderRadius: '8px', border: 'none', color: '#fff' }}
                />
                <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recently Added Table */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recently Added</h2>
          <Link to="/vault" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">View All</Link>
        </div>
        
        {recentVaults.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentVaults.map(vault => (
                <li key={vault._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center p-1.5">
                      {vault.favicon ? (
                        <img src={vault.favicon} alt="icon" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-lg text-gray-400">{vault.title ? vault.title.charAt(0) : '?'}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{vault.title || 'Untitled'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{vault.username || vault.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(vault.createdAt || Date.now()).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No passwords added yet.</p>
            <Link to="/vault" className="mt-4 inline-block text-primary-600 font-medium">Add your first password</Link>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
