const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId).select('-password -passwordResetToken -passwordResetExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('getProfile error', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { username, email } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (username) user.username = username;
    if (email) user.email = email;
    await user.save();
    res.json({ id: user._id, username: user.username, email: user.email });
  } catch (error) {
    console.error('updateProfile error', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

exports.getStorageInfo = async (req, res) => {
  try {
    // Simple placeholder - real implementation would calculate storage usage
    res.json({ usedMB: 12.4, limitMB: 1024 });
  } catch (error) {
    console.error('getStorageInfo error', error);
    res.status(500).json({ message: 'Failed to get storage info' });
  }
};
