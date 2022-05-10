const express = require('express');
const likesController = require('../controllers/likes');
const auth = require('../middleware/verifyToken')

export const path = '/user';
export const router = express.Router();

router.use(auth)

router.get('/', likesController.likesUser);
router.post('/', likesController.likesCreate);
router.delete('/', likesController.likesDelete);


