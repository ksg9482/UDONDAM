const express = require('express');
const recentController = require('../controllers/recent')
const auth = require('../middleware/verifyToken')


export const path = '/user';
export const router = express.Router();

router.use(auth)

router.get('/', recentController.get);
router.post('/', recentController.post);

