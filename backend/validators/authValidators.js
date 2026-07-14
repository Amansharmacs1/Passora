// Simple manual validation middleware as an alternative to Joi/Yup for now
const validateRegister = (req, res, next) => {
  const { fullName, email, password } = req.body;
  const errors = [];

  if (!fullName || fullName.length < 3) {
    errors.push('Name must be at least 3 characters');
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Must be a valid email');
  }

  // Password validation: min 8, uppercase, lowercase, number, special char
  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!password || !passRegex.test(password)) {
    errors.push('Password must be at least 8 characters, include an uppercase letter, lowercase letter, number, and special character');
  }

  if (errors.length > 0) {
    res.status(400);
    return next(new Error(errors.join('. ')));
  }

  next();
};

export { validateRegister };
