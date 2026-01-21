const User = require('../models/User');
const Tenant = require('../models/Tenant');

exports.register = async (req, res) => {
  try {
    const { name, email, password, tenantId } = req.body;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant || !tenant.isActive) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive tenant' });
    }

    const existingUser = await User.findOne({ email, tenant: tenantId });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists in this tenant' });
    }

    const user = await User.create({ name, email, password, tenant: tenantId, role: 'user' });
    const token = user.generateAuthToken();

    const userWithTenant = await User.findById(user._id).populate('tenant', 'name slug');

    res.status(201).json({
      success: true,
      data: { user: userWithTenant, token }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, tenantId } = req.body;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant || !tenant.isActive) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive tenant' });
    }

    const user = await User.findOne({ email, tenant: tenantId }).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = user.generateAuthToken();
    const userWithTenant = await User.findById(user._id).populate('tenant', 'name slug');

    res.json({
      success: true,
      data: { user: userWithTenant, token }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('tenant', 'name slug');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({ isActive: true }).select('name slug description');
    res.json({ success: true, data: tenants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};