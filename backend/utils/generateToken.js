import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '1h',
  });

  // Set JWT as HTTP-Only cookie if we want to do cookie-based auth, 
  // but requirements typically use Bearer tokens for MERN APIs unless specified.
  // The prompt asks to "Automatically attach JWT" and "Create Axios instance. Use interceptors.", 
  // which implies sending the token in the response and storing it on the client (e.g., localStorage),
  // then attaching it via headers. So we will return the token.
  
  return token;
};

export default generateToken;
