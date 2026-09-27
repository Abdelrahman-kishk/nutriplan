const User = require('../models/User');

/**
 * No-login mode: instead of verifying a JWT, every request is attributed to a
 * single persistent "Guest" account that is created on first use. This keeps
 * req.user populated (so controllers written for a multi-user app still work)
 * without requiring any sign-in step in the UI.
 */
let cachedGuestId = null;

const attachUser = async (req, res, next) => {
  try {
    let user = null;

    if (cachedGuestId) {
      user = await User.findById(cachedGuestId);
    }

    if (!user) {
      user = await User.findOne({ email: 'guest@nutriplan.local' });
    }

    if (!user) {
      user = await User.create({
        fullName: 'Guest User',
        email: 'guest@nutriplan.local',
        // Random password satisfies the schema; it is never used since there is no login.
        password: `guest-${Math.random().toString(36).slice(2)}A1!`,
        role: 'admin',
        subscription: 'Premium',
      });
    }

    cachedGuestId = user._id;
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { attachUser };
