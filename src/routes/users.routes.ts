import express from 'express';
import * as UserController from '../controllers/user';
import auth from '../middleware/verifyToken';
import { Users } from "../models/users";

export const path = '/user';
export const router = express.Router();
//router.use(auth)

router.get('/', UserController.userInfo);
//router.patch('/', UserController.userPatch);
//router.patch('/area', UserController.areaPatch);
//router.delete('/', UserController.userDelete);
