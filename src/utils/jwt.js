import jwt from 'jsonwebtoken';

/**
 * Generate JWT token for users (admin/worker)
 */
export const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Generate temporary JWT token for clients
 */
export const generateClientToken = (clientId, taskId) => {
  return jwt.sign(
    { clientId, taskId, type: 'client' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_CLIENT_EXPIRE || '24h' }
  );
};

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Decode JWT token without verification (for debugging)
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};

