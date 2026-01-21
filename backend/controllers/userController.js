const User = require('../models/User');
const Post = require('../models/Post');

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, tenantId, role } = req.query;
    let query = {};

    if (req.user.role !== 'admin') {
      query.tenant = req.tenantId;
    } else if (tenantId) {
      query.tenant = tenantId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) query.role = role;

    const users = await User.find(query)
      .populate('tenant', 'name slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('tenant', 'name slug');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.user.role !== 'admin' && user.tenant._id.toString() !== req.tenantId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, tenantId } = req.body;

    const existing = await User.findOne({ email, tenant: tenantId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists in this tenant' });
    }

    const user = await User.create({ name, email, password, role, tenant: tenantId });
    const populatedUser = await User.findById(user._id).populate('tenant', 'name slug');

    res.status(201).json({ success: true, data: populatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, password, role, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Regular user can only update themselves
    if (req.user.role !== 'admin' && user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    
    // FIX: Update password if provided
    if (password && password.trim() !== '') {
      user.password = password;
      console.log('Password updated to:', password); // For debugging
    }
    
    if (role && req.user.role === 'admin') user.role = role;
    if (isActive !== undefined && req.user.role === 'admin') user.isActive = isActive;

    await user.save();
    
    const updatedUser = await User.findById(user._id).populate('tenant', 'name slug');

    res.json({ success: true, data: updatedUser, message: 'User updated successfully' });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    }

    await Post.deleteMany({ author: user._id });
    await user.deleteOne();

    res.json({ success: true, message: 'User and their posts deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};