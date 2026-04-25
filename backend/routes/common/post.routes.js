const express = require('express');
const multer = require('multer');
const fs = require('fs');
const postController = require('../../controllers/common/post.controller');
const { authMiddleware } = require('../../middleware/auth/auth.middleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const validPrefixes = ['image/', 'video/', 'audio/'];
    if (validPrefixes.some(prefix => file.mimetype.startsWith(prefix))) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type! Only images, videos, and audio are allowed.'));
    }
  }
});

router.post('/', authMiddleware, upload.array('media', 4), postController.createPost);
router.get('/', authMiddleware, postController.getPosts);
router.post('/:id/like', authMiddleware, postController.likePost);
router.post('/:id/comment', authMiddleware, postController.commentOnPost);
router.put('/:id', authMiddleware, upload.array('media', 4), postController.updatePost);
router.delete('/:id', authMiddleware, postController.deletePost);

module.exports = router;
