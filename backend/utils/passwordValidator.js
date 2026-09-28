const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const validatePassword = (password) => {
  return PASSWORD_RULE.test(password);
};

const PASSWORD_ERROR_MESSAGE =
  'Password must be at least 8 characters and include uppercase, lowercase, and a number';

export { validatePassword, PASSWORD_ERROR_MESSAGE };
