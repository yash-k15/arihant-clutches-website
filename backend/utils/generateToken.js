const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV !== 'development',
  sameSite: 'strict',
};

const generateToken = (res, user) => {
  const token = jwt.sign(
    {
      userId: user._id,
      tokenVersion: user.tokenVersion,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d',
    },
  );

  res.cookie('token', token, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 24 * 60 * 60 * 1000,
  });
};

export { AUTH_COOKIE_OPTIONS };
export default generateToken;
