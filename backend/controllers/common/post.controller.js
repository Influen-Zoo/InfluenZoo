const postService = require('../../services/common/post.service');

const postController = {
  createPost: async (req, res) => {
    try {
      const post = await postService.createPost(req.userId, req.body, req.files);
      res.status(201).json({ success: true, post });
    } catch (error) {
      console.error('Create Post Error:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  },

  getPosts: async (req, res) => {
    try {
      const posts = await postService.getPosts();
      res.json({ success: true, posts });
    } catch (error) {
      console.error('Get Posts Error:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  },

  likePost: async (req, res) => {
    try {
      const likes = await postService.likePost(req.params.id, req.userId);
      res.json({ success: true, likes });
    } catch (error) {
      if (error.message === 'Post not found') return res.status(404).json({ error: error.message });
      res.status(500).json({ error: 'Failed to like post' });
    }
  },

  commentOnPost: async (req, res) => {
    try {
      const comments = await postService.commentOnPost(req.params.id, req.userId, req.body.text);
      res.json({ success: true, comments });
    } catch (error) {
      if (error.message === 'Comment text is required') return res.status(400).json({ error: error.message });
      if (error.message === 'Post not found') return res.status(404).json({ error: error.message });
      res.status(500).json({ error: 'Failed to comment' });
    }
  },

  updatePost: async (req, res) => {
    try {
      const post = await postService.updatePost(req.params.id, req.userId, req.body, req.files);
      res.json({ success: true, post });
    } catch (error) {
      if (error.message === 'Post not found') return res.status(404).json({ error: error.message });
      if (error.message === 'Not authorized') return res.status(403).json({ error: error.message });
      res.status(500).json({ error: 'Failed to update post' });
    }
  },

  deletePost: async (req, res) => {
    try {
      await postService.deletePost(req.params.id, req.userId);
      res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
      if (error.message === 'Post not found') return res.status(404).json({ error: error.message });
      if (error.message === 'Not authorized') return res.status(403).json({ error: error.message });
      res.status(500).json({ error: 'Failed to delete post' });
    }
  }
};

module.exports = postController;
