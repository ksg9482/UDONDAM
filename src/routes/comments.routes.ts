import express from 'express';
import * as commentRouter from '../controllers/comment';
import auth from '../middleware/verifyToken';

export const path = '/user';
export const router = express.Router();

router.use(auth)

router.get('/', commentRouter.commentUser);
router.post('/', commentRouter.commentCreate);
router.delete('/:commentId', commentRouter.commentDelete);
