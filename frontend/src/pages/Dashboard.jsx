import { useContext } from 'react';
import { VaultContext } from '../context/VaultContext';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaStar, FaArchive, FaTrash, FaClock } from 'react-icons/fa';
import { Link } from 'react-router-dom';

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

    // Get 5 most recent
    const recentVaults = [...vaults]
        .filter(v => !v.deleted && !v.archived)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard 
                    title="Total Passwords" 
                    value={stats.total} 
                    icon={FaShieldAlt} 
                    color="bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400"
                    link="/vault"
                />
                <StatCard 
                    title="Favorites" 
                    value={stats.favorites} 
                    icon={FaStar} 
                    color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-500"
                    link="/vault/favorites"
                />
                <StatCard 
                    title="Recently Added" 
                    value={stats.recentlyAdded} 
                    icon={FaClock} 
                    color="bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400"
                    link="/vault"
                />
                <StatCard 
                    title="Trash" 
                    value={stats.trash} 
                    icon={FaTrash} 
                    color="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                    link="/vault/trash"
                />
            </div>

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
                                                <span className="text-lg text-gray-400">{vault.title.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{vault.title}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{vault.username || vault.email}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">{new Date(vault.createdAt).toLocaleDateString()}</span>
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
