// Utility to calculate password strength entirely on the client side

export const calculateStrength = (password) => {
  if (!password) return { entropy: 0, score: 'Weak', crackTime: 'Instantly', percent: 0, color: 'bg-red-500', suggestions: [] };
  
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

  const entropy = password.length > 0 && poolSize > 0 
    ? password.length * Math.log2(poolSize) 
    : 0;

  let score = 'Weak';
  let percent = 20;
  let color = 'bg-red-500';

  if (entropy > 80) {
    score = 'Excellent';
    percent = 100;
    color = 'bg-blue-500';
  } else if (entropy > 60) {
    score = 'Strong';
    percent = 80;
    color = 'bg-green-500';
  } else if (entropy > 40) {
    score = 'Good';
    percent = 60;
    color = 'bg-yellow-400';
  } else if (entropy > 25) {
    score = 'Fair';
    percent = 40;
    color = 'bg-orange-500';
  }

  // Estimated crack time (very rough estimate assuming 10 billion guesses/sec)
  const guesses = Math.pow(2, entropy);
  const seconds = guesses / Math.pow(10, 10);
  
  let crackTime = 'Instantly';
  if (seconds > 31536000000000) crackTime = 'Millions of years';
  else if (seconds > 31536000000) crackTime = 'Thousands of years';
  else if (seconds > 31536000) crackTime = 'Years';
  else if (seconds > 2592000) crackTime = 'Months';
  else if (seconds > 86400) crackTime = 'Days';
  else if (seconds > 3600) crackTime = 'Hours';
  else if (seconds > 60) crackTime = 'Minutes';

  const suggestions = [];
  if (password.length < 12) suggestions.push('Make it longer (at least 12 characters).');
  if (!/[A-Z]/.test(password)) suggestions.push('Add uppercase letters.');
  if (!/[0-9]/.test(password)) suggestions.push('Add numbers.');
  if (!/[^a-zA-Z0-9]/.test(password)) suggestions.push('Add symbols.');

  return {
    entropy: Math.round(entropy),
    score,
    percent,
    color,
    crackTime,
    suggestions
  };
};
