const isValidEmail = (value) => {
  if (typeof value !== 'string') {
    return false;
  }

  const email = value.trim().toLowerCase();

  if (!email || email.length > 254) {
    return false;
  }

  // Only allow one plain email address.
  // Reject recipient-list/display-name syntax.
  if (/[,\s<>;]/.test(email)) {
    return false;
  }

  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
};

export default isValidEmail;
