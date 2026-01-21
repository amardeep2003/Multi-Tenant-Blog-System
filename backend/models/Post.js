const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  tags: [String],
  views: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

postSchema.pre(/^find/, function(next) {
  this.populate('author', 'name email');
  next();
});

module.exports = mongoose.model('Post', postSchema);