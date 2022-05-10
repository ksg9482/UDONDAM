const express = require('express');
const postController = require('../controllers/post')
const auth = require('../middleware/verifyToken')

export const path = '/user';
export const router = express.Router();

router.use(auth)

router.get('/', postController.postTag);
router.get('/user', postController.postUser);
router.get('/:postId', postController.postPick);
router.post('/', postController.postCreate);
router.delete('/:postId', postController.postDelete);

