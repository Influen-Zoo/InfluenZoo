const Post = require('../../models/Post');
const Analytics = require('../../models/Analytics');
const Notification = require('../../models/Notification');

const postService = {
  createPost: async (authorId, data, files) => {
    let mediaFiles = [];
    if (files && files.length > 0) {
      mediaFiles = files.map(file => {
        let type = 'image';
        if (file.mimetype.startsWith('video/')) type = 'video';
        else if (file.mimetype.startsWith('audio/')) type = 'audio';
        else if (file.mimetype === 'image/gif') type = 'gif';
        return { url: `/uploads/${file.filename}`, type };
      });
    }

    let parsedTags = [];
    if (data.tags) {
      try { parsedTags = JSON.parse(data.tags); }
      catch { parsedTags = data.tags.split(',').map(t => t.trim()); }
    }

    const content = typeof data.content === 'string' ? data.content.trim() : '';
    if (!content && mediaFiles.length === 0) {
      throw new Error('Post content or media is required');
    }

    const newPost = await Post.create({
      author: authorId,
      content,
      media: mediaFiles,
      tags: parsedTags,
    });

    return await Post.findById(newPost._id).populate('author', 'name avatar');
  },

  getPosts: async (userId = null) => {
    // Get non-blocked posts, or blocked posts if user is the author
    let query = { blocked: false };
    
    if (userId) {
      // Allow user to see their own blocked posts
      query = {
        $or: [
          { blocked: false },
          { blocked: true, author: userId }
        ]
      };
    }

    return await Post.find(query)
      .populate('author', 'name avatar')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 });
  },

  likePost: async (postId, userId) => {
    const post = await Post.findById(postId);
    if (!post) throw new Error('Post not found');

    const index = post.likes.indexOf(userId);
    if (index === -1) {
      post.likes.push(userId);
      // Log to Analytics - Credit the Post AUTHOR
      await Analytics.create({
        userId: post.author,
        type: 'engagement',
        metadata: { likes: 1, platform: 'Influence', action: 'like', postId }
      });

      // Send notification if not liking own post
      if (post.author.toString() !== userId.toString()) {
        const notification = new Notification({
          recipient: post.author,
          sender: userId,
          type: 'like',
          title: 'New Like',
          message: 'someone liked your post',
          relatedId: postId
        });
        await notification.save();
      }
    } else {
      post.likes.splice(index, 1);
    }
    
    await post.save();
    return post.likes;
  },

  commentOnPost: async (postId, userId, text) => {
    if (!text || !text.trim()) throw new Error('Comment text is required');
    const post = await Post.findById(postId);
    if (!post) throw new Error('Post not found');

    post.comments.push({ user: userId, text: text.trim() });
    await post.save();

    // Log to Analytics - Credit the Post AUTHOR
    await Analytics.create({
      userId: post.author,
      type: 'engagement',
      metadata: { comments: 1, platform: 'Influence', action: 'comment', postId }
    });

    // Send notification if not commenting on own post
    if (post.author.toString() !== userId.toString()) {
      const notification = new Notification({
        recipient: post.author,
        sender: userId,
        type: 'comment',
        title: 'New Comment',
        message: 'someone commented on your post',
        relatedId: postId
      });
      await notification.save();
    }

    const populated = await Post.findById(postId).populate('comments.user', 'name avatar');
    return populated.comments;
  },

  updatePost: async (postId, userId, data, files) => {
    const post = await Post.findById(postId);
    if (!post) throw new Error('Post not found');
    if (post.author.toString() !== userId) throw new Error('Not authorized');

    let parsedRetainedMedia = [];
    if (data.retainedMedia) {
      try { parsedRetainedMedia = JSON.parse(data.retainedMedia); } catch { parsedRetainedMedia = []; }
    }

    let mediaFiles = [];
    if (files && files.length > 0) {
      mediaFiles = files.map(file => {
        let type = 'image';
        if (file.mimetype.startsWith('video/')) type = 'video';
        else if (file.mimetype.startsWith('audio/')) type = 'audio';
        else if (file.mimetype === 'image/gif') type = 'gif';
        return { url: `/uploads/${file.filename}`, type };
      });
    }

    post.media = [...parsedRetainedMedia, ...mediaFiles];
    if (data.tags !== undefined) {
      try { post.tags = JSON.parse(data.tags); }
      catch { post.tags = typeof data.tags === 'string' ? data.tags.split(',').map(t => t.trim()) : data.tags; }
    }
    if (data.content !== undefined) post.content = data.content;

    await post.save();
    return await Post.findById(post._id).populate('author', 'name avatar').populate('comments.user', 'name avatar');
  },

  deletePost: async (postId, userId) => {
    const post = await Post.findById(postId);
    if (!post) throw new Error('Post not found');
    if (post.author.toString() !== userId) throw new Error('Not authorized');

    await post.deleteOne();
    return { success: true };
  }
};

module.exports = postService;
