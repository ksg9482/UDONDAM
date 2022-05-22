import express from 'express';
import * as userController from '../controllers/users.controller';
import auth from '../middleware/verifyToken';

export const path = '/user';
export const router = express.Router();
router.use(auth);

router.get('/', userController.userInfo);
router.patch('/', userController.userPatch);
router.patch('/area', userController.areaPatch);
router.delete('/', userController.userDelete);
