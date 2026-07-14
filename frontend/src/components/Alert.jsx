import { motion } from 'framer-motion';

const Alert = ({ type = 'info', message }) => {
  const types = {
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
  };

  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border mb-4 ${types[type]}`}
      role="alert"
    >
      {message}
    </motion.div>
  );
};

export default Alert;
