const validator = require('validator');

function signupDetailValidation({ name, email, password, role }) {
  const allowedRoles = ['ADMIN', 'MANAGER', 'MEMBER'];

  if (typeof name !== 'string' || validator.isEmpty(name.trim())) {
    throw new Error('Name is required');
  }

  if (!validator.isLength(name.trim(), { min: 3, max: 20 })) {
    throw new Error('Name must be between 3 and 20 characters');
  }

  if (typeof email !== 'string' || !validator.isEmail(email)) {
    throw new Error('Enter a valid email');
  }

  if (typeof password !== 'string' || validator.isEmpty(password)) {
    throw new Error('Password is required');
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error('Enter a strong password');
  }

  if (role && !allowedRoles.includes(role)) {
    throw new Error('Enter a valid role');
  }
}

module.exports = { signupDetailValidation };
