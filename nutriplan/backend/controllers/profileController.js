const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get the current (guest) profile
// @route   GET /api/profile
// @access  Public (no login required)
const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user.toSafeObject() });
});

// @desc    Update profile / daily macro targets
// @route   PATCH /api/profile
// @access  Public (no login required)
const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['fullName', 'avatarUrl', 'dailyTargets'];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, user: user.toSafeObject() });
});

module.exports = { getProfile, updateProfile };
