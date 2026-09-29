import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/userModel.js';
import ErrorResponse from '../utils/errorResponse.js';
import generateToken from '../utils/generateToken.js';
import resetPasswordEmail from '../utils/emailTemplates/resetPasswordEmail.js';
import jwt from 'jsonwebtoken';
import escapeRegex from '../utils/escapeRegex.js';
import EmailOTP from '../models/emailOtpModel.js';
import otpEmail from '../utils/emailTemplates/otpEmail.js';
import EmailVerification from '../models/emailVerificationModel.js';
import isValidEmail from '../utils/emailValidator.js';

import {
  generateOTP,
  hashOTP,
  verifyOTP as verifyOtpHash,
  OTP_EXPIRY_MINUTES,
  OTP_RESEND_COOLDOWN_SECONDS,
  MAX_OTP_ATTEMPTS,
} from '../utils/otp.js';

import {
  validatePassword,
  PASSWORD_ERROR_MESSAGE,
} from '../utils/passwordValidator.js';

import {
  validateAddress,
  validateString,
  isValidIndianPhone,
} from '../utils/inputValidation.js';

const SAFE_USER_FIELDS = '_id name email phone isAdmin createdAt';

// @desc    Auth user and get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (typeof email !== 'string' || typeof password !== 'string') {
    return next(new ErrorResponse('Invalid email or password', 401));
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid email or password', 401));
  }

  const passwordMatch = await user.matchPassword(password);

  if (!passwordMatch) {
    return next(new ErrorResponse('Invalid email or password', 401));
  }

  generateToken(res, user);

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isAdmin: user.isAdmin,
  });
});

// @desc    Register user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, verificationToken } = req.body;

  const normalizedEmail = email?.trim().toLowerCase();

  if (!name?.trim() || !normalizedEmail || !password) {
    return next(
      new ErrorResponse('Name, email and password are required', 400),
    );
  }

  if (!validatePassword(password)) {
    return next(new ErrorResponse(PASSWORD_ERROR_MESSAGE, 400));
  }

  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists) {
    return next(
      new ErrorResponse(
        'Unable to create account with the provided details',
        400,
      ),
    );
  }

  const normalizedPhone = phone?.trim();

  if (normalizedPhone && !/^[6-9]\d{9}$/.test(normalizedPhone)) {
    return next(new ErrorResponse('Enter a valid mobile number', 400));
  }

  if (normalizedPhone) {
    const phoneExists = await User.findOne({ phone: normalizedPhone });

    if (phoneExists) {
      return next(new ErrorResponse('Phone number already registered', 400));
    }
  }

  // Email OTP registration
  if (verificationToken) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    const verification = await EmailVerification.findOne({
      email: normalizedEmail,
      tokenHash,
      expiresAt: { $gt: Date.now() },
    });

    if (!verification) {
      return next(
        new ErrorResponse(
          'Email verification has expired or is invalid. Please verify your email again.',
          400,
        ),
      );
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone || undefined,
      password,
    });

    // One-time use
    await EmailVerification.deleteOne({
      _id: verification._id,
    });

    generateToken(res, user);

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
    });
  }

  // Normal registration
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: normalizedPhone || undefined,
    password,
  });

  generateToken(res, user);

  return res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isAdmin: user.isAdmin,
  });
});

// @desc    Logout user / clear cookies
// @route   POST /api/users/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId);

      if (user) {
        user.tokenVersion += 1;
        await user.save();
      }
    } catch (err) {
      // Token is already invalid/expired/revoked.
      // That's fine — logout should still clear the cookie.
    }
  }

  res.cookie('token', 'none', {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
  });

  res.status(200).json({
    message: 'Logged out successfully',
  });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isAdmin: user.isAdmin,
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  if (req.body.name !== undefined) {
    const nameValidation = validateString(req.body.name, {
      required: true,
      min: 2,
      max: 100,
    });

    if (!nameValidation.valid) {
      return next(
        new ErrorResponse('Name must be between 2 and 100 characters', 400),
      );
    }

    user.name = nameValidation.value;
  }

  if (req.body.phone !== undefined) {
    if (typeof req.body.phone !== 'string') {
      return next(new ErrorResponse('Invalid phone number', 400));
    }

    const normalizedPhone = req.body.phone.trim();

    if (normalizedPhone && !isValidIndianPhone(normalizedPhone)) {
      return next(new ErrorResponse('Enter a valid mobile number', 400));
    }

    if (normalizedPhone && normalizedPhone !== user.phone) {
      const existingUser = await User.findOne({
        phone: normalizedPhone,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return next(new ErrorResponse('Phone number already registered', 400));
      }
    }

    user.phone = normalizedPhone || undefined;
  }

  const updateUser = await user.save();

  res.status(200).json({
    _id: updateUser._id,
    name: updateUser.name,
    email: updateUser.email,
    phone: updateUser.phone,
    isAdmin: updateUser.isAdmin,
  });
});

// @desc    Get user saved addresses
// @route   GET /api/users/addresses
// @access  Private
const getUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('addresses');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  const defaultAddress =
    user.addresses.find((address) => address.isDefault) || null;

  res.status(200).json({
    addresses: user.addresses,
    defaultAddress,
  });
});

// @desc    Add user saved address
// @route   POST /api/users/addresses
// @access  Private
const addUserAddress = asyncHandler(async (req, res, next) => {
  const {
    fullName,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    isDefault,
  } = req.body;

  const addressValidation = validateAddress(req.body);

  if (!addressValidation.valid) {
    return next(new ErrorResponse(addressValidation.message, 400));
  }

  if (isDefault !== undefined && typeof isDefault !== 'boolean') {
    return next(new ErrorResponse('isDefault must be a boolean', 400));
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  if (user.addresses.length >= 10) {
    return next(
      new ErrorResponse('You can save a maximum of 10 addresses', 400),
    );
  }

  if (
    !fullName ||
    !phone ||
    !addressLine1 ||
    !city ||
    !state ||
    !postalCode ||
    !country
  ) {
    return next(
      new ErrorResponse('Please provide all required address fields', 400),
    );
  }

  const shouldBeDefault = user.addresses.length === 0 || isDefault === true;

  if (shouldBeDefault) {
    user.addresses.forEach((address) => {
      address.isDefault = false;
    });
  }

  user.addresses.push({
    fullName: fullName.trim(),
    phone: phone.trim(),
    addressLine1: addressLine1.trim(),
    addressLine2: addressLine2?.trim() || '',
    city: city.trim(),
    state: state.trim(),
    postalCode: postalCode.trim(),
    country: country.trim(),
    isDefault: shouldBeDefault,
  });

  await user.save();

  const newAddress = user.addresses[user.addresses.length - 1];

  res.status(201).json(newAddress);
});

// @desc    Update user saved address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
const updateUserAddress = asyncHandler(async (req, res, next) => {
  const {
    fullName,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    isDefault,
  } = req.body;

  const addressValidation = validateAddress(req.body);

  if (!addressValidation.valid) {
    return next(new ErrorResponse(addressValidation.message, 400));
  }

  if (isDefault !== undefined && typeof isDefault !== 'boolean') {
    return next(new ErrorResponse('isDefault must be a boolean', 400));
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    return next(new ErrorResponse('Address not found', 404));
  }

  if (
    !fullName ||
    !phone ||
    !addressLine1 ||
    !city ||
    !state ||
    !postalCode ||
    !country
  ) {
    return next(
      new ErrorResponse('Please provide all required address fields', 400),
    );
  }

  if (isDefault === true) {
    user.addresses.forEach((item) => {
      item.isDefault = false;
    });
  }

  address.fullName = fullName.trim();
  address.phone = phone.trim();
  address.addressLine1 = addressLine1.trim();
  address.addressLine2 = addressLine2?.trim() || '';
  address.city = city.trim();
  address.state = state.trim();
  address.postalCode = postalCode.trim();
  address.country = country.trim();
  address.isDefault = isDefault === true;

  await user.save();

  res.status(200).json(address);
});

// @desc    Delete user saved address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const deleteUserAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    return next(new ErrorResponse('Address not found', 404));
  }

  const wasDefault = address.isDefault;

  user.addresses.pull(address._id);

  // If the deleted address was the default,
  // make the first remaining address the default.
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  res.status(200).json({
    message: 'Address deleted successfully',
  });
});

// @desc    Set user saved address as default
// @route   PUT /api/users/addresses/:addressId/default
// @access  Private
const setDefaultUserAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    return next(new ErrorResponse('Address not found', 404));
  }

  user.addresses.forEach((item) => {
    item.isDefault = item._id.equals(address._id);
  });

  await user.save();

  res.status(200).json(address);
});

// @desc    Change user phone number
// @route   PUT /api/users/change-phone
// @access  Private
// const changeUserPhone = asyncHandler(async (req, res, next) => {
//   const phone = String(req.body.phone).trim();

//   if (!phone) {
//     return next(new ErrorResponse('Phone number is required', 400));
//   }

//   if (!/^[6-9]\d{9}$/.test(phone)) {
//     return next(new ErrorResponse('Enter a valid mobile number', 400));
//   }

//   const user = await User.findById(req.user._id);

//   if (!user) {
//     return next(new ErrorResponse('User not found', 404));
//   }

//   if (user.phone === phone) {
//     return next(
//       new ErrorResponse('This is already your current phone number', 400),
//     );
//   }

//   const existingUser = await User.findOne({ phone });

//   if (existingUser) {
//     return next(new ErrorResponse('Phone number already registered', 400));
//   }

//   user.phone = phone;
//   user.phoneVerified = true;

//   const updatedUser = await user.save();

//   res.status(200).json({
//     _id: updatedUser._id,
//     name: updatedUser.name,
//     email: updatedUser.email,
//     phone: updatedUser.phone,
//     isAdmin: updatedUser.isAdmin,
//   });
// });

// @desc    Get users
// @route   GET /api/users
// @access  Private/admin
const getUsers = asyncHandler(async (req, res, next) => {
  const pageSize = Number(process.env.ADMIN_USERS_PER_PAGE) || 10;
  const page = Number(req.query.pageNumber) || 1;

  const filters = {};

  // Search
  if (req.query.keyword) {
    const searchRegex = {
      $regex: escapeRegex(req.query.keyword),
      $options: 'i',
    };

    filters.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  // Role
  if (req.query.role === 'admin') {
    filters.isAdmin = true;
  } else if (req.query.role === 'customer') {
    filters.isAdmin = false;
  }

  const count = await User.countDocuments(filters);

  // Sorting
  let sortOption = { createdAt: -1 };

  switch (req.query.sort) {
    case 'oldest':
      sortOption = { createdAt: 1 };
      break;

    case 'name-asc':
      sortOption = { name: 1, createdAt: -1 };
      break;

    case 'name-desc':
      sortOption = { name: -1, createdAt: -1 };
      break;

    case 'latest':
    default:
      sortOption = { createdAt: -1 };
      break;
  }

  const users = await User.find(filters)
    .select(SAFE_USER_FIELDS)
    .sort(sortOption)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.status(200).json({
    users,
    page,
    pages: Math.ceil(count / pageSize),
  });
});

// @desc    Get user by id
// @route   GET /api/users/:id
// @access  Private/admin
const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select(SAFE_USER_FIELDS);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json(user);
});

// @desc    Delete users
// @route   DELETE /api/users/:id
// @access  Private/admin
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  if (user.isAdmin) {
    return next(new ErrorResponse('Cannot delete admin user', 404));
  }

  await User.deleteOne({ _id: user._id });
  res.status(200).json({ message: 'User deleted successfully' });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/admin
const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.isAdmin = Boolean(req.body.isAdmin);

  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    isAdmin: updatedUser.isAdmin,
  });
});

// @desc        Forgot Password
// @route       POST /api/users/forgotpassword
// @access      Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  if (typeof req.body.email !== 'string') {
    return next(new ErrorResponse('Please provide a valid email address', 400));
  }

  const normalizedEmail = req.body.email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'A password reset email has been sent.',
    });
  }

  // Get reset Token
  const resetToken = await user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${process.env.CLIENT_URL}/resetpassword/${resetToken}`;

  // const message = `You are recieving this email because you have requested the reset of your password.
  // Please open: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset your Arihant Clutches password',
      html: resetPasswordEmail(resetUrl),
    });

    return res.status(200).json({
      success: true,
      message: 'A password reset email has been sent.',
    });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc        Reset Password
// @route       PUT /api/users/resetpassword/:token
// @access      Public
const resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  const { password } = req.body;

  if (!password) {
    return next(new ErrorResponse('New password is required', 400));
  }

  if (!validatePassword(password)) {
    return next(new ErrorResponse(PASSWORD_ERROR_MESSAGE, 400));
  }

  // Set new Password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.tokenVersion += 1;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfull',
  });
});

/* ================================
   Phone based sendOTP
================================ */
// @desc        Send OTP
// @route       POST /api/users/send-otp
// @access      Public
// const sendOTP = asyncHandler(async (req, res, next) => {
//   const phone = String(req.body.phone).trim();
//   const { purpose } = req.body;

//   if (!phone) {
//     return next(new ErrorResponse('Phone number is required', 400));
//   }

//   if (!/^[6-9]\d{9}$/.test(phone)) {
//     return next(new ErrorResponse('Enter a valid mobile number', 400));
//     return;
//   }

//   if (purpose === 'phone-change') {
//     const existingUser = await User.findOne({ phone });

//     if (existingUser) {
//       return next(new ErrorResponse('Phone number already registered', 400));
//     }
//   }

//   res.status(200).json({
//     success: true,
//     message: 'OTP sent successfully',
//   });
// });

/* ================================
   Email based sendOTP
================================ */
// @desc    Send Email OTP for login
// @route   POST /api/users/send-otp
// @access  Public
const sendOTP = asyncHandler(async (req, res, next) => {
  if (typeof req.body.email !== 'string') {
    return next(new ErrorResponse('Please provide a valid email address', 400));
  }

  const email = req.body.email.trim().toLowerCase();

  if (!isValidEmail(email)) {
    return next(new ErrorResponse('Please provide a valid email address', 400));
  }

  const now = new Date();

  // Check resend cooldown
  const existingOtp = await EmailOTP.findOne({ email });

  if (existingOtp) {
    const elapsedSeconds =
      (now.getTime() - existingOtp.lastSentAt.getTime()) / 1000;

    if (elapsedSeconds < OTP_RESEND_COOLDOWN_SECONDS) {
      const remainingSeconds = Math.ceil(
        OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds,
      );

      return next(
        new ErrorResponse(
          `Please wait ${remainingSeconds} seconds before requesting another OTP`,
          429,
        ),
      );
    }
  }

  // Generate a new OTP
  const otp = generateOTP();

  // Hash OTP before storing it
  const otpHash = hashOTP(otp);

  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

  let otpRecord;

  try {
    /*
     * Replace the existing OTP for this email.
     *
     * IMPORTANT:
     * - attempts is intentionally NOT reset here.
     * - A new OTP invalidates the previous OTP because the stored hash
     *   is replaced.
     * - The unique email index guarantees one OTP document per email.
     */
    otpRecord = await EmailOTP.findOneAndUpdate(
      { email },
      {
        $set: {
          otpHash,
          expiresAt,
          lastSentAt: now,
        },
        $setOnInsert: {
          email,
          attempts: 0,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );
  } catch (error) {
    // Another concurrent request may have created the OTP first.
    // The unique email index prevents duplicate OTP documents.
    if (error?.code === 11000) {
      return next(
        new ErrorResponse('Unable to generate OTP. Please try again.', 429),
      );
    }

    throw error;
  }

  try {
    await sendEmail({
      email,
      subject: 'Your Arihant Clutches Login OTP',
      html: otpEmail(otp, OTP_EXPIRY_MINUTES),
    });

    return res.status(200).json({
      success: true,
      message: 'If an account exists for this email, an OTP has been sent.',
    });
  } catch (err) {
    console.error('Email OTP delivery failed:', err);

    /*
     * Only remove the OTP we just created/replaced.
     *
     * This prevents a failed email from accidentally deleting
     * a newer OTP generated by another request.
     */
    await EmailOTP.deleteOne({
      _id: otpRecord._id,
      otpHash,
    });

    return next(new ErrorResponse('Unable to send OTP email', 500));
  }
});

/* ================================
   Phone based verifyOTP
================================ */
// @desc        Verify OTP
// @route       POST /api/users/verify-otp
// @access      Public
// const verifyOTP = asyncHandler(async (req, res, next) => {
//   const { otp } = req.body;
//   const phone = String(req.body.phone).trim();

//   if (String(otp) !== '123456') {
//     return next(new ErrorResponse('Invalid OTP', 400));
//   }

//   const user = await User.findOne({ phone });

//   if (!user) {
//     return res.status(200).json({
//       isNewUser: true,
//       phone,
//     });
//   }

//   generateToken(res, user);

//   res.status(200).json({
//     isNewUser: false,
//     _id: user._id,
//     name: user.name,
//     email: user.email,
//     phone: user.phone,
//     isAdmin: user.isAdmin,
//   });
// });

/* ================================
   Email based verifyOTP
================================ */
// @desc        Verify OTP
// @route       POST /api/users/verify-otp
// @access      Public
const verifyOTP = asyncHandler(async (req, res, next) => {
  if (typeof req.body.email !== 'string') {
    return next(new ErrorResponse('Please provide a valid email address', 400));
  }

  const email = req.body.email.trim().toLowerCase();
  const otp = req.body.otp?.trim();

  if (!isValidEmail(email) || !otp) {
    return next(new ErrorResponse('Email and OTP are required', 400));
  }

  if (!/^\d{6}$/.test(otp)) {
    return next(new ErrorResponse('Invalid OTP', 400));
  }

  const otpRecord = await EmailOTP.findOne({ email });

  if (!otpRecord) {
    return next(new ErrorResponse('Invalid or expired OTP', 400));
  }

  // Check expiration
  if (otpRecord.expiresAt.getTime() <= Date.now()) {
    await EmailOTP.deleteOne({ _id: otpRecord._id });

    return next(new ErrorResponse('Invalid or expired OTP', 400));
  }

  // Check maximum attempts
  if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
    await EmailOTP.deleteOne({ _id: otpRecord._id });

    return next(
      new ErrorResponse(
        'Too many incorrect attempts. Please request a new OTP',
        429,
      ),
    );
  }

  // Verify the submitted OTP against the stored hash.
  const isValid = verifyOtpHash(otp, otpRecord.otpHash);

  if (!isValid) {
    /*
     * Atomically increment the failed-attempt counter.
     *
     * The attempts < MAX_OTP_ATTEMPTS condition is important:
     * concurrent requests cannot all successfully increment the
     * counter beyond the configured limit.
     */
    const updatedOtp = await EmailOTP.findOneAndUpdate(
      {
        _id: otpRecord._id,
        attempts: { $lt: MAX_OTP_ATTEMPTS },
      },
      {
        $inc: { attempts: 1 },
      },
      {
        new: true,
      },
    );

    if (!updatedOtp) {
      return next(
        new ErrorResponse(
          'Too many incorrect attempts. Please request a new OTP',
          429,
        ),
      );
    }

    const attemptsRemaining = MAX_OTP_ATTEMPTS - updatedOtp.attempts;

    if (attemptsRemaining <= 0) {
      await EmailOTP.deleteOne({
        _id: updatedOtp._id,
        attempts: MAX_OTP_ATTEMPTS,
      });

      return next(
        new ErrorResponse(
          'Too many incorrect attempts. Please request a new OTP',
          429,
        ),
      );
    }

    return next(
      new ErrorResponse(
        `Invalid OTP. ${attemptsRemaining} attempts remaining`,
        400,
      ),
    );
  }

  /*
   * OTP is valid.
   *
   * Atomically delete the exact OTP record we verified.
   * This prevents the same OTP from being successfully consumed
   * by multiple concurrent requests.
   */
  const consumedOtp = await EmailOTP.findOneAndDelete({
    _id: otpRecord._id,
    otpHash: otpRecord.otpHash,
    expiresAt: { $gt: new Date() },
  });

  if (!consumedOtp) {
    return next(new ErrorResponse('Invalid or expired OTP', 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    const verificationToken = await createEmailVerificationToken(email);

    return res.status(200).json({
      success: true,
      isNewUser: true,
      email,
      verificationToken,
    });
  }

  // Log the user in using the existing JWT cookie
  generateToken(res, user);

  return res.status(200).json({
    success: true,
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isAdmin: user.isAdmin,
  });
});

// @desc    Verify OTP for phone number change
// @route   POST /api/users/verify-phone-change-otp
// @access  Private
// const verifyPhoneChangeOTP = asyncHandler(async (req, res, next) => {
//   const { otp, purpose } = req.body;
//   const phone = String(req.body.phone).trim();

//   if (purpose !== 'phone-change') {
//     return next(new ErrorResponse('Invalid OTP purpose', 400));
//   }

//   if (!phone) {
//     return next(new ErrorResponse('Phone number is required', 400));
//   }

//   if (!/^[6-9]\d{9}$/.test(phone)) {
//     return next(new ErrorResponse('Enter a valid mobile number', 400));
//   }

//   if (String(otp) !== '123456') {
//     return next(new ErrorResponse('Invalid OTP', 400));
//   }

//   const user = await User.findById(req.user._id);

//   if (!user) {
//     return next(new ErrorResponse('User not found', 404));
//   }

//   if (user.phone === phone) {
//     return next(
//       new ErrorResponse('This is already your current phone number', 400),
//     );
//   }

//   const existingUser = await User.findOne({ phone });

//   if (existingUser) {
//     return next(new ErrorResponse('Phone number already registered', 400));
//   }

//   user.phone = phone;
//   user.phoneVerified = true;

//   const updatedUser = await user.save();

//   res.status(200).json({
//     _id: updatedUser._id,
//     name: updatedUser.name,
//     email: updatedUser.email,
//     phone: updatedUser.phone,
//     isAdmin: updatedUser.isAdmin,
//   });
// });

// @desc        Register With Phone
// @route       POST /api/users/register-phone
// @access      Public
// const registerWithPhone = asyncHandler(async (req, res, next) => {
//   const { name } = req.body;
//   const email = req.body.email?.trim();
//   const phone = String(req.body.phone).trim();

//   if (!email) {
//     return res.status(400).json({
//       message: 'Email is required',
//     });
//   }

//   const existingUser = await User.findOne({ phone });

//   if (existingUser) {
//     return next(new ErrorResponse('Phone number already registered', 400));
//   }

//   const user = await User.create({
//     name,
//     email,
//     phone,
//     password: crypto.randomBytes(32).toString('hex'),
//     phoneVerified: true,
//   });

//   generateToken(res, user);

//   res.status(201).json({
//     _id: user._id,
//     name: user.name,
//     email: user.email,
//     phone: user.phone,
//     isAdmin: user.isAdmin,
//   });
// });

// @desc    Send OTP for password change
// @route   POST /api/users/send-password-change-otp
// @access  Private
// const sendPasswordChangeOTP = asyncHandler(async (req, res, next) => {
//   const user = await User.findById(req.user._id);

//   if (!user) {
//     return next(new ErrorResponse('User not found', 404));
//   }

//   if (!user.isAdmin) {
//     return next(
//       new ErrorResponse(
//         'Password change is only available for admin accounts',
//         403,
//       ),
//     );
//   }

//   res.status(200).json({
//     success: true,
//     message: 'OTP sent successfully',
//   });
// });

// @desc    Verify OTP for password change
// @route   POST /api/users/verify-password-change-otp
// @access  Private
// const verifyPasswordChangeOTP = asyncHandler(async (req, res, next) => {
//   const { otp } = req.body;

//   const user = await User.findById(req.user._id);

//   if (!user) {
//     return next(new ErrorResponse('User not found', 404));
//   }

//   if (!user.isAdmin) {
//     return next(
//       new ErrorResponse(
//         'Password change is only available for admin accounts',
//         403,
//       ),
//     );
//   }

//   if (String(otp) !== '123456') {
//     return next(new ErrorResponse('Invalid OTP', 400));
//   }

//   const passwordChangeToken = jwt.sign(
//     {
//       userId: user._id,
//       purpose: 'password-change',
//     },
//     process.env.JWT_SECRET,
//     {
//       expiresIn: '10m',
//     },
//   );

//   res.status(200).json({
//     success: true,
//     message: 'OTP verified successfully',
//     passwordChangeToken,
//   });
// });

// @desc    Change admin password
// @route   PUT /api/users/change-password
// @access  Private
// const changeAdminPassword = asyncHandler(async (req, res, next) => {
//   const { passwordChangeToken, newPassword } = req.body;

//   if (!passwordChangeToken) {
//     return next(
//       new ErrorResponse('Password change authorization is required', 400),
//     );
//   }

//   if (!newPassword) {
//     return next(new ErrorResponse('New password is required', 400));
//   }

//   if (newPassword.length < 6) {
//     return next(
//       new ErrorResponse('Password must be at least 6 characters', 400),
//     );
//   }

//   let decodedToken;

//   try {
//     decodedToken = jwt.verify(passwordChangeToken, process.env.JWT_SECRET);
//   } catch (error) {
//     return next(
//       new ErrorResponse(
//         'Password change authorization has expired or is invalid',
//         401,
//       ),
//     );
//   }

//   if (decodedToken.purpose !== 'password-change') {
//     return next(
//       new ErrorResponse('Invalid password change authorization', 401),
//     );
//   }

//   if (String(decodedToken.userId) !== String(req.user._id)) {
//     return next(
//       new ErrorResponse('Invalid password change authorization', 401),
//     );
//   }

//   const user = await User.findById(req.user._id).select('+password');

//   if (!user) {
//     return next(new ErrorResponse('User not found', 404));
//   }

//   if (!user.isAdmin) {
//     return next(
//       new ErrorResponse(
//         'Password change is only available for admin accounts',
//         403,
//       ),
//     );
//   }

//   user.password = newPassword;

//   await user.save();

//   res.status(200).json({
//     success: true,
//     message: 'Password changed successfully',
//   });
// });

const createEmailVerificationToken = async (email) => {
  const token = crypto.randomBytes(32).toString('hex');

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await EmailVerification.deleteMany({ email });

  await EmailVerification.create({
    email,
    tokenHash,
    expiresAt,
  });

  return token;
};

// Get token from model, create cookie and send response
// const sendTokenResponse = (user, statusCode, res) => {
//   // Create token
//   const token = user.getSignedJwtToken();

//   const options = {
//     expires: new Date(
//       Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
//     ),
//     httpOnly: true,
//   };

//   if (process.env.NODE_ENV === 'production') {
//     options.secure = true;
//   }

//   res
//     .status(statusCode)
//     .cookie('token', token, options)
//     .json({ success: true, token });
// };

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultUserAddress,
  // changeUserPhone,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  forgotPassword,
  resetPassword,
  sendOTP,
  verifyOTP,
  // verifyPhoneChangeOTP,
  // registerWithPhone,
  // sendPasswordChangeOTP,
  // verifyPasswordChangeOTP,
  // changeAdminPassword,
};
