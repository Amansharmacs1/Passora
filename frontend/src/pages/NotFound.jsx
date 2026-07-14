import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gray-50 dark:bg-gray-900">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <h1 className="text-9xl font-black text-gray-200 dark:text-gray-800 tracking-tighter">404</h1>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-4">Page not found</p>
        <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <Link to="/">
          <Button variant="primary" className="px-8 py-3">
            Go back home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
