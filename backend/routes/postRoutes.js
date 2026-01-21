const express = require('express');
const router = express.Router();
const { getAllPosts, getPost, createPost, updatePost, deletePost, getPostStats } = require('../controllers/postController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/stats', getPostStats);

router.route('/')
  .get(getAllPosts)
  .post(createPost);

router.route('/:id')
  .get(getPost)
  .put(updatePost)
  .delete(deletePost);

module.exports = router;