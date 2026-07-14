import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BsSunFill, BsMoonFill } from 'react-icons/bs';
import Button from './Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-white dark:bg-gray-900 sticky top-0 z-40 w-full flex-none transition-colors duration-500 lg:z-50 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              Passora
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <BsSunFill size={20} /> : <BsMoonFill size={20} />}
            </button>

            {user ? (
              <>
                <Link to="/profile" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-md transition-colors dark:hover:text-primary-400 font-medium">
                  Dashboard
                </Link>
                <Button variant="outline" onClick={logout} className="ml-4">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-md transition-colors dark:hover:text-primary-400 font-medium">
                  Login
                </Link>
                <Link to="/register" className="inline-block">
                  <Button variant="primary">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
