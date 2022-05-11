import express from 'express';
import * as likesController from '../controllers/likes.controller';
import auth from '../middleware/verifyToken';

export const path = '/likes';
export const router = express.Router();

router.use(auth)

router.get('/', likesController.likesUser);
router.post('/', likesController.likesCreate);
router.delete('/', likesController.likesDelete);


