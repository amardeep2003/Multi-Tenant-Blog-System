const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Post = require('../models/Post');

exports.getAllTenants = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    let query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const tenants = await Tenant.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Tenant.countDocuments(query);

    // Get counts for each tenant
    const tenantsWithCounts = await Promise.all(tenants.map(async (tenant) => {
      const userCount = await User.countDocuments({ tenant: tenant._id });
      const postCount = await Post.countDocuments({ tenant: tenant._id });
      return { ...tenant.toObject(), userCount, postCount };
    }));

    res.json({
      success: true,
      data: tenantsWithCounts,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }
    res.json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTenant = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const existing = await Tenant.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Tenant name already exists' });
    }

    const tenant = await Tenant.create({ name, description });
    res.status(201).json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTenant = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    if (name) tenant.name = name;
    if (description !== undefined) tenant.description = description;
    if (isActive !== undefined) tenant.isActive = isActive;

    await tenant.save();
    res.json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const userCount = await User.countDocuments({ tenant: tenant._id });
    if (userCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete tenant with ${userCount} users. Delete users first.` 
      });
    }

    await tenant.deleteOne();
    res.json({ success: true, message: 'Tenant deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};