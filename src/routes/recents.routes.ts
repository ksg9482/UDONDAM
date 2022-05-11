import express from 'express';
import * as recentController from '../controllers/recents.controller';
import auth from '../middleware/verifyToken';


export const path = '/recent';
export const router = express.Router();

router.use(auth)

router.get('/', recentController.get);
router.post('/', recentController.post);

