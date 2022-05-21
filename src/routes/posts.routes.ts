import express from 'express';
import * as postController from '../controllers/posts.controller';
import auth from '../middleware/verifyToken';

export const path = '/post';
export const router = express.Router();

router.use(auth)

router.get('/', postController.postTag);
router.get('/user', postController.postUser);
router.get('/:postId', postController.postPick);
router.post('/', postController.postCreate);
router.delete('/:postId', postController.postDelete);

