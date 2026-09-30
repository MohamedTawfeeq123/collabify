const jwt = require('jsonwebtoken');

/**
 * Generate JSON Web Token
 * Signs the user ID with expiration period
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'collabify_super_secret_jwt_key_2026_production', {
    expiresIn: '30d'
  });
};

module.exports = generateToken;
