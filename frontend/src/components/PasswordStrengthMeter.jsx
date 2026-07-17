import { calculateStrength } from '../utils/passwordStrength';

const PasswordStrengthMeter = ({ password }) => {
  const result = calculateStrength(password);

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Strength: {result.score}</span>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Crack Time: {result.crackTime}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
        <div 
          className={`h-1.5 rounded-full transition-all duration-300 ${result.color}`}
          style={{ width: `${result.percent}%` }}
        ></div>
      </div>
      
      {result.suggestions.length > 0 && (
        <ul className="mt-2 space-y-1">
          {result.suggestions.map((suggestion, index) => (
            <li key={index} className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-500"></span>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
