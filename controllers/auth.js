const User = require('../models/User');

// Helper สำหรับส่ง Token และเก็บใน Cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') options.secure = true;
  res.status(statusCode).cookie('token', token, options).json({ success: true, token });
};

//@route  POST /api/v1/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, tel} = req.body;

    const user = await User.create({
      name,
      email,
      password,
      role : role || 'user',
      tel
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false });
    console.log(err.stack);
  }
};

//@route  POST /api/v1/auth/login
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, msg: 'Please provide email and password' });

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, msg: 'Invalid credentials' });
  }

  sendTokenResponse(user, 200, res);
};

//@route  GET /api/v1/auth/logout
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.status(200).json({ success: true, data: {} });
};

exports.getMe = async (req, res, next) => {
  
  const user = await User.findById(req.user.id);
  
  res.status(200).json({
    success: true,
    data: user
  });
};