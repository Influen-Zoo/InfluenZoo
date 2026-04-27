const express = require('express');
const multer = require('multer');
const fs = require('fs');
const postController = require('../../controllers/common/post.controller');
const { authMiddleware } = require('../../middleware/auth/auth.middleware');
const { losslessImageCompression } = require('../../middleware/common/losslessImageCompression.middleware');

const router = express.Router();
const MAX_MEDIA_FILE_SIZE = 25 * 1024 * 1024;

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
  limits: { fileSize: MAX_MEDIA_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const validPrefixes = ['image/', 'video/', 'audio/'];
    if (validPrefixes.some(prefix => file.mimetype.startsWith(prefix))) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type! Only images, videos, and audio are allowed.'));
    }
  }
});

router.post('/', authMiddleware, upload.array('media', 4), losslessImageCompression, postController.createPost);
router.get('/', authMiddleware, postController.getPosts);
router.post('/:id/like', authMiddleware, postController.likePost);
router.post('/:id/comment', authMiddleware, postController.commentOnPost);
router.put('/:id', authMiddleware, upload.array('media', 4), losslessImageCompression, postController.updatePost);
router.delete('/:id', authMiddleware, postController.deletePost);

module.exports = router;
