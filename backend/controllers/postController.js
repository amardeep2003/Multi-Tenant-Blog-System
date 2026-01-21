const Post = require('../models/Post');

exports.getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, tenantId } = req.query;
    let query = {};

    // Admin can see all posts, regular user only sees their own
    if (req.user.role === 'admin') {
      if (tenantId) query.tenant = tenantId;
    } else {
      query.tenant = req.tenantId;
      query.author = req.user._id;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) query.status = status;

    const posts = await Post.find(query)
      .populate('tenant', 'name slug')
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      data: posts,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('tenant', 'name slug')
      .populate('author', 'name email');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check access
    if (req.user.role !== 'admin' && post.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    post.views += 1;
    await post.save({ validateBeforeSave: false });

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { title, content, status, tags } = req.body;

    const post = await Post.create({
      title,
      content,
      status: status || 'published',
      tags: tags || [],
      tenant: req.tenantId,
      author: req.user._id
    });

    const populatedPost = await Post.findById(post._id)
      .populate('tenant', 'name slug')
      .populate('author', 'name email');

    res.status(201).json({ success: true, data: populatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { title, content, status, tags } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check access
    if (req.user.role !== 'admin' && post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (title) post.title = title;
    if (content) post.content = content;
    if (status) post.status = status;
    if (tags) post.tags = tags;

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('tenant', 'name slug')
      .populate('author', 'name email');

    res.json({ success: true, data: updatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check access
    if (req.user.role !== 'admin' && post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPostStats = async (req, res) => {
  try {
    let matchQuery = {};
    
    if (req.user.role !== 'admin') {
      matchQuery = { tenant: req.tenantId, author: req.user._id };
    }

    const stats = await Post.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = { draft: 0, published: 0, archived: 0, total: 0 };
    stats.forEach(s => {
      result[s._id] = s.count;
      result.total += s.count;
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};