const express = require('express');
const commentRouter = require('../controllers/comment');
const auth = require('../middleware/verifyToken')

export const path = '/user';
export const router = express.Router();

router.use(auth)

router.get('/', commentRouter.commentUser);
router.post('/', commentRouter.commentCreate);
router.delete('/:commentId', commentRouter.commentDelete);
