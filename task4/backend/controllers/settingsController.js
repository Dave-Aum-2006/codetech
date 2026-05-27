import User from '../models/User.js';

// @desc    Update user productivity settings
// @route   PUT /api/settings
// @access  Private
export const updateSettings = async (req, res) => {
  const { blockedDomains, customClassifications } = req.body;

  try {
    let user;
    if (global.useMockDB) {
      const db = global.getMockTrackerDb();
      user = db.users.find(u => u._id.toString() === req.user._id.toString());
    } else {
      user = await User.findById(req.user._id);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (blockedDomains) {
      user.settings.blockedDomains = blockedDomains;
    }
    
    if (customClassifications) {
      // Handle map updates
      if (global.useMockDB) {
        user.settings.customClassifications = {
          ...user.settings.customClassifications,
          ...customClassifications
        };
      } else {
        Object.keys(customClassifications).forEach(domain => {
          user.settings.customClassifications.set(domain, customClassifications[domain]);
        });
      }
    }

    if (!global.useMockDB) {
      await user.save();
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      settings: user.settings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
