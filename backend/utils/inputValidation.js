const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

const isValidIndianPhone = (value) =>
  typeof value === 'string' && /^[6-9]\d{9}$/.test(value.trim());

const isValidIndianPostalCode = (value) =>
  typeof value === 'string' && /^\d{6}$/.test(value.trim());

const validateString = (value, { required = false, min = 0, max }) => {
  if (value === undefined || value === null) {
    return {
      valid: !required,
      value: undefined,
    };
  }

  if (typeof value !== 'string') {
    return {
      valid: false,
      value: undefined,
    };
  }

  const trimmed = value.trim();

  if (required && !trimmed) {
    return {
      valid: false,
      value: undefined,
    };
  }

  if (trimmed.length < min || trimmed.length > max) {
    return {
      valid: false,
      value: undefined,
    };
  }

  return {
    valid: true,
    value: trimmed,
  };
};

const validateAddress = (address) => {
  if (!address || typeof address !== 'object' || Array.isArray(address)) {
    return {
      valid: false,
      message: 'Invalid address data',
    };
  }

  if (
    !validateString(address.fullName, {
      required: true,
      min: 2,
      max: 100,
    }).valid
  ) {
    return {
      valid: false,
      message: 'Full name must be between 2 and 100 characters',
    };
  }

  if (!isValidIndianPhone(address.phone)) {
    return {
      valid: false,
      message: 'Enter a valid mobile number',
    };
  }

  if (
    !validateString(address.addressLine1, {
      required: true,
      min: 3,
      max: 200,
    }).valid
  ) {
    return {
      valid: false,
      message: 'Address line 1 must be between 3 and 200 characters',
    };
  }

  if (
    address.addressLine2 !== undefined &&
    !validateString(address.addressLine2, {
      max: 200,
    }).valid
  ) {
    return {
      valid: false,
      message: 'Address line 2 cannot exceed 200 characters',
    };
  }

  if (
    !validateString(address.city, {
      required: true,
      min: 2,
      max: 100,
    }).valid
  ) {
    return {
      valid: false,
      message: 'City must be between 2 and 100 characters',
    };
  }

  if (
    !validateString(address.state, {
      required: true,
      min: 2,
      max: 100,
    }).valid
  ) {
    return {
      valid: false,
      message: 'State must be between 2 and 100 characters',
    };
  }

  if (!isValidIndianPostalCode(address.postalCode)) {
    return {
      valid: false,
      message: 'Enter a valid 6-digit postal code',
    };
  }

  if (
    !validateString(address.country, {
      required: true,
      min: 2,
      max: 100,
    }).valid
  ) {
    return {
      valid: false,
      message: 'Country must be between 2 and 100 characters',
    };
  }

  return {
    valid: true,
    message: '',
  };
};

const isFiniteNumber = (value) =>
  typeof value === 'number' && Number.isFinite(value);

const isValidHttpUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) {
    return false;
  }

  try {
    const url = new URL(value.trim());

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export {
  isNonEmptyString,
  isValidIndianPhone,
  isValidIndianPostalCode,
  validateString,
  validateAddress,
  isFiniteNumber,
  isValidHttpUrl,
};
