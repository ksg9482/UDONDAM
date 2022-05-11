import express from 'express';
import * as recentController from '../controllers/recent.controller';
import auth from '../middleware/verifyToken';


export const path = '/user';
export const router = express.Router();

router.use(auth)

router.get('/', recentController.get);
router.post('/', recentController.post);

